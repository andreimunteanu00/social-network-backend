import {Story} from "../entity/story";

const fs = require("fs");

export class FileController {

  static getPhoto = async function(image: string) {
    let img = await fs.promises.readFile(image, 'base64');
    return 'data:image/jpg;base64,' + img;
  }

  static uploadPhoto = async function(image: string, path: string) {
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    await fs.promises.writeFile(path, base64Data, 'base64');
  }

  static getStoryProfilePhotos = async (stories: Story[]) => {
    for (let story of stories) {
      if (story.author.profilePic != null) {
        story.userProfilePhoto = await Promise.resolve(FileController.getPhoto(story.author.profilePic));
      }
    }
  }
}

