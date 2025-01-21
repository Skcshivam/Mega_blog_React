import React from "react";
import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";

function PostCard({ $id, title, featuredImage }) {
  // Check if featuredImage exists and is valid
  const previewUrl = featuredImage
    ? appwriteService.getFilePreview(featuredImage)
    : null;

  return (
    <Link to={`/post/${$id}`}>
      <div className="w-full bg-gray-100 rounded-xl p-4">
        <div className="w-full justify-center mb-4">
          {previewUrl ? (
            <img src={previewUrl} alt={title} className="rounded-xl" />
          ) : (
            <div className="bg-gray-300 w-full h-48 rounded-xl flex justify-center items-center">
              <span className="text-gray-600">No image available</span>
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
    </Link>
  );
}

export default PostCard;
  