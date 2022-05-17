import {Post} from "../entity/post";
import {User} from "../entity/user";

export const checkLikedPosts = (user: User, posts: Post[]) => {
    for (let post of posts) {
        post.alreadyLiked = post.userLikesIds.includes(user.id);
    }
}