import {Post} from "../entity/post";
import {User} from "../entity/user";

export const checkLikedPosts = (user: User, posts: Post[]) => {
    for (let post of posts) {
        post.alreadyLiked = post.userLikesIds.includes(user.id);
    }
}

export const getCreateTimeAsString = (post: Post) => {
    const currentDate = new Date();

    const msBetweenDates = Math.abs(currentDate.valueOf() - post.createDate.valueOf());
    const hoursBetweenDates = msBetweenDates / 3600000;

    if (hoursBetweenDates < 24) {
        if (hoursBetweenDates < 1) {
            post.timeCreatedString = "Less than an hour ago";
        } else {
            post.timeCreatedString = Math.floor(hoursBetweenDates) + "h ago";
        }
        return;
    }

    const daysBetweenDates = hoursBetweenDates / 24;
    post.timeCreatedString = Math.floor(daysBetweenDates) + "d ago";
}

export const getTimeCreated = (posts: Post[]) => {
    for (let post of posts) {
        getCreateTimeAsString(post);
    }
}