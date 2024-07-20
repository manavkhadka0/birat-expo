"use client";
import ExhibitionForm from "@/components/exhibition-form";
import React, { Suspense } from "react";

const BookStalls = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="mb-40">
        <ExhibitionForm />
      </div>
    </Suspense>
  );
};

export default BookStalls;
