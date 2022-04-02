/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Playlist_name_key" ON "Playlist"("name");
