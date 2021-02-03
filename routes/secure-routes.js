const express = require("express");
const router = express.Router();
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const UserModel = require("../model/model");

router.get("/profile", (req, res, next) => {
  res.json({
    user: req.user,
  });
});

router.post("/result", async (req, res, next) => {
  return (
    await UserModel.findByIdAndUpdate(req.user._id, {
      $push: {
        results: {
          wpm: req.body.wpm,
          cpm: req.body.cpm,
          acc: req.body.acc,
          timer: req.body.timer,
          // uuid: uuid.v1(),
        },
      },
    }),
    res.status(201)
  );
});

router.get("/result", async (req, res, next) => {
  res.json({
    user: await UserModel.findById(req.user._id),
  });
});

router.get("/pb", async (req, res) => {
  const user = await UserModel.findById(req.user._id);

  res.json(user.pb);
});

router.post("/pb", async (req, res) => {
  await UserModel.findByIdAndUpdate(req.user._id, {
    $push: {
      pb: {
        timer: req.body.timer,
        wpm: req.body.wpm,
        cpm: req.body.cpm,
        acc: req.body.acc,
      },
    },
  });
});

router.delete("/pb", async (req, res) => {
  // TODO
  // Find user
  // Get correct pb (corresponding time: req.body.timer)
  // Delete it

  const user = await UserModel.findByIdAndUpdate(req.user._id, {
    $pull: {
      pb: {
        timer: req.body.timer,
        wpm: req.body.wpm,
        cpm: req.body.cpm,
        acc: req.body.acc,
      },
    },
  });

  res.json(user.pb);
});

router.get("/leaderboard", async (req, res) => {
  return res.json(await UserModel.find({}));
});

module.exports = router;
