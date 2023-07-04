const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const { UserModel, UserValid, validLogin, createToken } = require("../models/userModel");
const { authToken, authTokenAdmin } = require("../auth/authToken");


router.get("/", async (req, res) => {
  res.json({ msg: "Users work" })
})

router.get("/checkToken", authToken, async (req, res) => {
  res.json(req.tokenData);
})


router.get("/usersList", authTokenAdmin, async (req, res) => {
  let perPage = req.query.perPage || 5;
  let page = req.query.page || 1;
  try {
    let data = await UserModel.find({})
    .limit(perPage)
    .skip((page - 1) * perPage)
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err });
  }
})
// אזור שמחזיר למשתמש את הפרטים שלו לפי הטוקן שהוא שולח
router.get("/myInfo", authToken, async (req, res) => {
  try {
    let userInfo = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
    res.json(userInfo);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.get("/count", authTokenAdmin, async (req, res) => {
  try {
    let count = await UserModel.countDocuments({})
    res.json({ count })
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})
router.get("/byId/:id", authTokenAdmin, async (req, res) => {
  try {
    let id=req.params.id;
    let user = await UserModel.findOne({_id:id})
    res.json({ user })
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.post("/register", async(req,res) => {
  let validBody = UserValid(req.body);
  // במידה ויש טעות בריק באדי שהגיע מצד לקוח
  // יווצר מאפיין בשם אירור ונחזיר את הפירוט של הטעות
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  try{
    let user = new UserModel(req.body);
    // נרצה להצפין את הסיסמא בצורה חד כיוונית
    // 10 - רמת הצפנה שהיא מעולה לעסק בינוני , קטן
    user.password = await bcrypt.hash(user.password, 10);
    
    await user.save();
    user.password = "***";
    let newToken = createToken(user._id, user.role)
    const combinedResponse = {
      user: user,
      token: newToken
    };
    res.status(201).json(combinedResponse);
  }
  catch(err){
    if(err.code == 11000){
      return res.status(500).json({msg:"Email already exists, try  to log in",code:11000})
       
    }
    console.log(err);
    res.status(500).json({msg:"err",err})
  }
})

router.post("/login", async (req, res) => {
  let valdiateBody = validLogin(req.body);
  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details)
  }
  try {
    // לבדוק אם המייל שנשלח בכלל יש רשומה של משתמש שלו
    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      // שגיאת אבטחה שנשלחה מצד לקוח
      return res.status(401).json({ msg: "there was a problem. try again later" })
    }
    // בדיקה הסימא אם מה שנמצא בבאדי מתאים לסיסמא המוצפנת במסד
    let validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ msg: "your email or password are incorrect. " })
    }
    
    console.log(user._id)
    let newToken = createToken(user._id, user.role)
    const combinedResponse = {
      user: user,
      token: newToken
    };
    res.status(201).json(combinedResponse);
  }
  catch (err) {

    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.put("/:editId", authTokenAdmin, async (req, res) => {
  let validBody = UserValid(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let editId = req.params.editId;
    let data;
    if (req.tokenData.role == "admin") {
      data = await UserModel.updateOne({ _id: editId }, req.body)
    }
    else {
      data = await UserModel.updateOne({ _id: editId, _id: req.tokenData._id }, req.body)
    }
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there was a problem. try again later", err })
  }
})


// מאפשר לשנות משתמש לאדמין, רק על ידי אדמין אחר
router.patch("/changeRole/:userID", authTokenAdmin, async (req, res) => {
  if (!req.body.role) {
    return res.status(400).json({ msg: "Need to send role in body" });
  }

  try {
    let userID = req.params.userID
    // לא מאפשר ליוזר אדמין להפוך למשהו אחר/ כי הוא הסופר אדמין
    // TODO:move to config
    if (userID == "648e1c1acb1ae4796def29b5") {
      return res.status(401).json({ msg: "You cant change superadmin to user" });

    }
    let data = await UserModel.updateOne({ _id: userID }, { role: req.body.role })
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.delete("/:idDel", authTokenAdmin, async (req, res) => {
  try {
    let idDel = req.params.idDel
    let data;
    if (idDel == "648e1c1acb1ae4796def29b5") {
      return res.status(401).json({ msg: "You cant delete superadmin" });

    }
    // data = await UserModel.deleteOne({ _id: idDel });
    data = await UserModel.updateOne({ _id: idDel }, { active: "false" });
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})

router.patch("/changeActive/:userID", authTokenAdmin, async (req, res) => {
  if (!req.body.active && req.body.active != false) {
    return res.status(400).json({ msg: "Need to send active in body" });
  }

  try {
    let userID = req.params.userID
    // לא מאפשר ליוזר אדמין להפוך למשהו אחר/ כי הוא הסופר אדמין
    if (userID == "648e1c1acb1ae4796def29b5") {
      return res.status(401).json({ msg: "You cant change superadmin to user" });

    }
    let data = await UserModel.updateOne({ _id: userID }, { active: req.body.active })
    res.json(data);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: "err", err })
  }
})


module.exports = router;
