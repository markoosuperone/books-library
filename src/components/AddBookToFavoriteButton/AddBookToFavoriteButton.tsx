"use client";

import { GoogleBookVolume } from "@/models/booksData";
import { GRAPHQL_ENDPOINT } from "@/lib/constants";

interface AddBookToFavoriteButtonProps {
  book: GoogleBookVolume;
}

const AddBookToFavoriteButton = ({ book }: AddBookToFavoriteButtonProps) => {
  
  const handleAddToFavorites = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault(); // cancel the Link navigation
    e.stopPropagation();
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation AddFavoriteBook($input: GoogleBooksResponseInput) {
              addFavoriteBook(input: $input) {
                id
                volumeInfo {
                  title
                  authors
                  imageLinks {
                    thumbnail
                  }
                }
              }
            }
          `,
          variables: {
            input: {
              id: book.id,
              volumeInfo: {
                title: book.volumeInfo.title,
                authors: book.volumeInfo.authors,
                imageLinks: {
                  thumbnail: book.volumeInfo.imageLinks?.thumbnail,
                },
              },
            },
          },
        }),
      });

      const result = await response.json();
      console.log("Book added to favorites:", result);
    } catch (error) {
      console.error("Error adding book to favorites:", error);
    }
  };

  return <button onClick={handleAddToFavorites}>Add to Favorites</button>;
};

export default AddBookToFavoriteButton;
