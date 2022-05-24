import {Router} from "express";
import {checkJwt} from "../middleware/checkJwt";
import StoryController from "../controller/story.controller";

const router = Router();

router.post('/', [checkJwt], StoryController.postStory);

router.get('/feed', [checkJwt], StoryController.getStoryFeed);

router.get('/:storyId/media', [checkJwt], StoryController.getStoryMedia);

export default router;