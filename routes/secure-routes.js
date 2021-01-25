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

module.exports = router;
