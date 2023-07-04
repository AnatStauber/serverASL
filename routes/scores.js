const express = require("express");
const { ScoreModel, validateScore } = require("../models/scoreModel");
const { authToken, authTokenAdmin } = require("../auth/authToken");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ msg: "score work !" })
})

router.get("/allScores", async (req, res) => {

  try {
    let data = await ScoreModel.find({})
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})



router.get("/getMaxScore", async (req, res) => {
  console.log("dd");
  try {
    let data = await ScoreModel.find({})
      .populate({ path: "user_id", model: "users" })
      .limit(5)
      .sort({ score: -1, date_created: 1 })
    // .populate({ path: "user_id", model: "users" })
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err });
  }
});








router.get("/getScoresByUserId/:id", async (req, res) => {

  try {
    let idUser = req.params.id;
    let data;
    data = await ScoreModel.find({ user_id: idUser });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err })
  }
})

router.post("/", authToken, async (req, res) => {
  let validBody = validateScore(req.body);
  if (validBody.error) {
    res.status(400).json(validBody.error.details)
    return;
  }
  try {
    console.log(req.tokenData._id)
    let score = new ScoreModel(req.body);
    score.user_id = req.tokenData._id;
    let data = await score.save();
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.delete("/:idDel", authToken, async (req, res) => {
  try {
    let idDel = req.params.idDel
    let data;
    if (req.tokenData.role == "admin") {
      data = await ScoreModel.deleteOne({ _id: idDel });
    }
    else {
      data = await ScoreModel.deleteOne({ _id: idDel, user_id: req.tokenData._id });
    }
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})


router.patch("/changeScore/:userID",  async (req, res) => {
    try {
    let userID = req.params.userID
  
    let data = await ScoreModel.updateOne({ user_id: userID }, { score: req.body.score })
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

module.exports = router;
