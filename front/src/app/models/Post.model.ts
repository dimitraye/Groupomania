export class Post {
  userId!: string;
  _id!: string;
  title!: string;
  content!: string;
  imageUrl!: string;
  likes!: number;
  dislikes!: number;
  usersLiked!: string[];
  usersDisliked!: string[];
  date!: Date;
}
