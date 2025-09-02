import express from "express";
import jwt from "jsonwebtoken";
import { userModel, contentModel, linkModel } from "./db";
import { jwt_SECRET } from "./config";
import { auth } from "./middleware";
import { random } from "./utils";
// import { z } from "zod";
const app = express();
app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
  try {
    //Zod , Hash Password
    const username = req.body.username;
    const password = req.body.password;
    // const user = userModel.findOne({
    //   username: username,
    // });

    // if (!user) {
    await userModel.create({
      username,
      password,
    });
    res.json({ msg: "You are signed up" });
    // }
  } catch (e) {
    res.status(403).send({
      msg: "Invalid credentials",
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const ifExist = await userModel.findOne({
    username,
    password,
  });
  if (ifExist) {
    const token = jwt.sign(
      {
        id: ifExist._id,
      },
      jwt_SECRET
    );

    res.json({
      msg: "You are signed in",
      token: token,
    });
  } else {
    res.status(403).json({
      message: "Invalid credentials",
    });
  }
});

app.post("/api/v1/content", auth, async (req, res) => {
  try {
    const { link, type, title } = req.body;

    await contentModel.create({
      link,
      type,
      title,
      tags: [],
      //@ts-ignore
      userId: req.userId,
    });

    res.json({
      msg: "Content is added",
    });
  } catch (e: any) {
    res.status(403).json({
      msg: "Wrong input",
      e: e.message,
    });
  }
});

app.get("/api/v1/content", auth, async (req, res) => {
  try {
    const content = await contentModel
      .find({
        //@ts-ignore
        userId: req.userId,
      })
      .populate("userId", "username");
    res.json({
      content: content,
    });
  } catch (e: any) {
    res.status(403).json({
      e: e.message,
      msg: "Wrong user",
    });
  }
});

app.delete("/api/v1/content", auth, async (req, res) => {
  try {
    const contentId = req.body.contentId;

    await contentModel.deleteMany({
      _id: contentId,
      //@ts-ignore
      userId: req.userId,
    });
    res.json({
      msg: "deleted successfully",
    });
  } catch (e: any) {
    res.status(403).json({
      msg: "Cant delete",
      e: e.message,
    });
  }
});

app.post("/api/v1/brain/share", auth, async (req, res) => {
  const share = req.body.share;
  if (share) {
    const hash = await linkModel.create({
      //@ts-ignore
      userId: req.userId,
      hash: random(10),
    });
    res.json({
      message: "updated the sharable link",
      link: "/share/" + hash.hash,
    });
  } else {
    await linkModel.deleteOne({
      //@ts-ignore
      userId: req.userId,
    });

    res.json({
      message: "Removed link"
    })
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;
  const link = await linkModel.findOne({
    hash: hash,
  });

  if (!link) {
    res.status(411).json({
      msg: "Sorry wrong hash",
    });
    return;
  }
  const content = await contentModel.find({
    userId: link.userId,
  });

  const user = await userModel.findOne({
    _id: link.userId,
  });

  res.json({
    username: user?.username,
    content: content,
  });
});

app.listen(3000);
