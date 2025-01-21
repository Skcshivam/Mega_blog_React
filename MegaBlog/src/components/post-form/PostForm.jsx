import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from ".."; // Assuming these are your custom components
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.$id || "",
      content: post?.content || "",
      status: post?.status || "active", // Default value for status
    },
  });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  // Slug transformation function
  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string")
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s+/g, "-");
    return "";
  }, []);

  // Automatically update slug when title changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  // Submit handler
  const submit = async (data) => {
    try {
      console.log("Form Data:", data);

      // Handle file upload
      let fileId = null;
      if (data.image && data.image[0]) {
        const file = await appwriteService.uploadFile(data.image[0]);
        if (!file || !file.$id) {
          console.error("File upload failed.");
          return;
        }
        fileId = file.$id;
        console.log("Uploaded file ID:", fileId);
      }

      if (post) {
        // Update post logic
        if (fileId) {
          await appwriteService.deleteFile(post.featuredImage);
        }
        const dbPost = await appwriteService.updatePost(post.$id, {
          ...data,
          featuredImage: fileId || post.featuredImage,
        });

        if (dbPost && dbPost.$id) {
          console.log("Post updated:", dbPost);
          navigate(`/post/${dbPost.$id}`);
        } else {
          console.error("Post update failed.");
        }
      } else {
        // Create new post logic
        const dbPost = await appwriteService.createPost({
          ...data,
          featuredImage: fileId,
          userId: userData?.$id,
        });

        if (dbPost && dbPost.$id) {
          console.log("Post created:", dbPost);
          navigate(`/post/${dbPost.$id}`);
        } else {
          console.error("Post creation failed.");
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      {/* Left Section */}
      <div className="w-2/3 px-2">
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("title", { required: "Title is required." })}
        />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}

        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", { required: "Slug is required." })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true,
            });
          }}
        />
        {errors.slug && <p className="text-red-500">{errors.slug.message}</p>}

        <RTE
          label="Content :"
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>

      {/* Right Section */}
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image :"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", {
            required: !post && "Featured image is required for new posts.",
          })}
        />
        {errors.image && <p className="text-red-500">{errors.image.message}</p>}

        {post && post.featuredImage && (
          <div className="w-full mb-4">
            <img
              src={appwriteService.getFilePreview(post.featuredImage)}
              alt={post.title}
              className="rounded-lg"
            />
          </div>
        )}

        {/* Status Select */}
        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: "Status is required." })}
          defaultValue={post?.status || "active"} // Default value for existing post
        />
        {errors.status && (
          <p className="text-red-500">{errors.status.message}</p>
        )}

        <Button
          type="submit"
          bgColor={post ? "bg-green-500" : undefined}
          className="w-full"
        >
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
