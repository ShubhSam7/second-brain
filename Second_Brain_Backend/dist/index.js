"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const config_1 = require("./config");
const middleware_1 = require("./middleware");
const utils_1 = require("./utils");
// import { z } from "zod";
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Zod , Hash Password
        const username = req.body.username;
        const password = req.body.password;
        // const user = userModel.findOne({
        //   username: username,
        // });
        // if (!user) {
        yield db_1.userModel.create({
            username,
            password,
        });
        res.json({ msg: "You are signed up" });
        // }
    }
    catch (e) {
        res.status(403).send({
            msg: "Invalid credentials",
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    const ifExist = yield db_1.userModel.findOne({
        username,
        password,
    });
    if (ifExist) {
        const token = jsonwebtoken_1.default.sign({
            id: ifExist._id,
        }, config_1.jwt_SECRET);
        res.json({
            msg: "You are signed in",
            token: token,
        });
    }
    else {
        res.status(403).json({
            message: "Invalid credentials",
        });
    }
}));
app.post("/api/v1/content", middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { link, type, title } = req.body;
        yield db_1.contentModel.create({
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
    }
    catch (e) {
        res.status(403).json({
            msg: "Wrong input",
            e: e.message,
        });
    }
}));
app.get("/api/v1/content", middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const content = yield db_1.contentModel
            .find({
            //@ts-ignore
            userId: req.userId,
        })
            .populate("userId", "username");
        res.json({
            content: content,
        });
    }
    catch (e) {
        res.status(403).json({
            e: e.message,
            msg: "Wrong user",
        });
    }
}));
app.delete("/api/v1/content", middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contentId = req.body.contentId;
        yield db_1.contentModel.deleteMany({
            _id: contentId,
            //@ts-ignore
            userId: req.userId,
        });
        res.json({
            msg: "deleted successfully",
        });
    }
    catch (e) {
        res.status(403).json({
            msg: "Cant delete",
            e: e.message,
        });
    }
}));
app.post("/api/v1/brain/share", middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    if (share) {
        const hash = yield db_1.linkModel.create({
            //@ts-ignore
            userId: req.userId,
            hash: (0, utils_1.random)(10),
        });
        res.json({
            message: "updated the sharable link",
            link: "/share/" + hash.hash,
        });
    }
    else {
        yield db_1.linkModel.deleteOne({
            //@ts-ignore
            userId: req.userId,
        });
        res.json({
            message: "Removed link"
        });
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield db_1.linkModel.findOne({
        hash: hash,
    });
    if (!link) {
        res.status(411).json({
            msg: "Sorry wrong hash",
        });
        return;
    }
    const content = yield db_1.contentModel.find({
        userId: link.userId,
    });
    const user = yield db_1.userModel.findOne({
        _id: link.userId,
    });
    res.json({
        username: user === null || user === void 0 ? void 0 : user.username,
        content: content,
    });
}));
app.listen(3000);
