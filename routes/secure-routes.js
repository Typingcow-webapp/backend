const express = require("express");
const router = express.Router();
const UserModel = require("../model/model");
const bcrypt = require("bcrypt");

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
          timer: req.body.timer,
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
      },
    },
  });
});

router.delete("/pb", async (req, res) => {
  const user = await UserModel.findByIdAndUpdate(req.user._id, {
    $pull: {
      pb: {
        timer: req.body.timer,
        wpm: req.body.wpm,
        cpm: req.body.cpm,
      },
    },
  });

  res.json(user.pb);
});

router.get("/leaderboard", async (req, res) => {
  return res.json(await UserModel.find({}));
});

router.post("/resetpass", async (req, res) => {
  const hash = await bcrypt.hash(req.body.newpass, 10);

  await UserModel.findByIdAndUpdate(req.user._id, {
    password: hash,
  });

  return res.status(205);
});

module.exports = router;
