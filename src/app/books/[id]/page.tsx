import React from "react";
import styles from "./bookPage.module.scss";
import Image from "next/image";
import { getVolume } from "@/lib/google-books";

const BookPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const book = await getVolume(id);

  if (!book) {
    return <div>Book not found</div>;
  }

  const { title, authors, description, imageLinks } = book.volumeInfo;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <h3>{authors ? authors.join(", ") : "Unknown Author"}</h3>
      {imageLinks?.thumbnail && (
        <Image
          src={imageLinks.thumbnail}
          alt={`${title} cover`}
          className={styles.imagePlaceholder}
          width={300}
          height={400}
        />
      )}
      <p className={styles.description}>{description || "No description available."}</p>
    </div>
  );
};
export default BookPage;
