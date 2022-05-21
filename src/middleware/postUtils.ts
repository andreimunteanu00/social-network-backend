import {Post} from "../entity/post";
import {User} from "../entity/user";
import {Comment} from "../entity/comment";

export const checkLikedPosts = (user: User, posts: Post[]) => {
    for (let post of posts) {
        post.alreadyLiked = post.userLikesIds.includes(user.id);
    }
}

export const getCreateTimeAsString = (obj: Post | Comment) => {
    const currentDate = new Date();

    const msBetweenDates = Math.abs(currentDate.valueOf() - obj.createDate.valueOf());
    const hoursBetweenDates = msBetweenDates / 3600000;

    if (hoursBetweenDates < 24) {
        if (hoursBetweenDates < 1) {
            obj.timeCreatedString = "Less than an hour ago";
        } else {
            obj.timeCreatedString = Math.floor(hoursBetweenDates) + "h ago";
        }
        return;
    }

    const daysBetweenDates = hoursBetweenDates / 24;
    obj.timeCreatedString = Math.floor(daysBetweenDates) + "d ago";
}

export const getTimeCreated = (posts: Post[] | Comment[]) => {
    for (let post of posts) {
        getCreateTimeAsString(post);
    }
}