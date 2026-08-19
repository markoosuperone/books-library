"use client";
import { useEffect, useState } from "react";
import { GoogleBookVolume } from "@/models/booksData";
import BookCard from "@/components/BookCard/BookCard";
import Link from "next/link";
import { GRAPHQL_ENDPOINT } from "@/lib/constants";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<GoogleBookVolume[]>([]);
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
            query GetFavoriteBooks {
              favoriteBooks {
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
          }),
        });

        const result = await response.json();
        console.log("Fetched favorite books:", result);
        setFavorites(result.data.favoriteBooks);
      } catch (error) {
        console.error("Error fetching favorite books:", error);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <div>
      {favorites.length > 0 ? (
        <ul>
          {favorites.map((book) => (
            <Link key={book.id} href={`/favorites/${book.id}`}>
              <BookCard book={book} isFavorite />
            </Link>
          ))}
        </ul>
      ) : (
        <p>No favorite books found.</p>
      )}
    </div>
  );
};

export default FavoritesPage;
