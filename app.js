const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const ejsMate = require("ejs-mate");
const Location = require("./models/location");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const catchAsync = require("./utils/catchAsync");
const User = require("./models/user");
const axios = require("axios");
const Reservoir = require("./models/reservoir");
const User2 = require("./models/user2");
const net = require("net");

const serverAddress = "3.35.1.49";
const serverPort = 23579;

const client = new net.Socket();

client.connect(serverPort, serverAddress, () => {
  client.write("Hello, server! I'm requesting some data.");
});

client.on("data", (data) => {
  console.log("Received data from server:", data.toString());
  if (data.includes("sense=ok;")) {
    console.log("Received 'sense=ok;' from the server!");
    // 원하는 처리 수행
  }
});

client.on("close", () => {
  console.log("Connection closed");
});

client.on("error", (err) => {
  console.error("Error:", err.message);
});

/*
TODO:
3. search : 지점이름, 관리번호, 소재지, 관할지사 (reservoir.js)
- onclick -> 지점이름, 주소

4. 저수지, 사용자 데이터베이스에 저장하고 화면에 띄우기 (reservoir.js, user2.js)
- reservoir.js app.post('/reservoirData')
- user2.js app.post('/userData')


5. 마커 클릭시 색 변경, 지점이름 띄우기
- 마커 컬러는 이미지로써 적용이 가능한듯?
- 지점이름 완료
*/

//modified
//MongoServerSelectionError: connect ECONNREFUSED ::1:27017
//localhost -> 0.0.0.0
mongoose.connect("mongodb://0.0.0.0:27017/jeosooji", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database connected");
});

const app = express();

const thingSpeak_KEY = "TJINH2I1U11WNSLU";
const thingSpeak_ID = "1395732";

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("__method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use(bodyParser.json())

app.get("/", async (req, res) => {
  const response = await axios.get(`https://api.thingspeak.com/channels/${thingSpeak_ID}/feeds.json?api_key=${thingSpeak_KEY}`);
  const feeds = response.data.feeds;
  const reservoirs = await Reservoir.find();
  res.render("home", {
    feeds: feeds,
    reservoirs: reservoirs,
  });
});

app.get("/location/:id", async (req, res) => {
  const reservoir = await Reservoir.findById(req.params.id);
  res.render("location", { reservoir });
});

app.delete("/location/:id", async (req, res) => {
  const { id } = req.params;
  if (!req.isAuthenticated()) {
    req.flash("error", "관리자 로그인 필요");
    res.redirect(`/location/${id}`);
  } else {
    await Location.findByIdAndDelete(id);
    res.send("<script>window.opener.location.reload(); window.close();</script>");
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/admin", (req, res) => {
  // admin 확인을 위해 잠시 주석처리 해둠
  // if (!req.isAuthenticated()) {
  //   req.flash("error", "관리자 로그인 필요");
  //   return res.redirect("/login");
  // }
  res.render("admin");
});

app.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "회원가입 완료");
        res.redirect("/admin");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
    successFlash: true,
    successRedirect: "/",
  })
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      req.flash("error", "로그아웃 중 오류가 발생했습니다.");
      return res.redirect("/");
    }
    req.flash("success", "로그아웃");
    res.redirect("/");
  });
});

app.get("/data", async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "관리자 로그인 필요");
    return res.redirect("/login");
  }
  try {
    const response = await axios.get(`https://api.thingspeak.com/channels/${thingSpeak_ID}/feeds.json?api_key=${thingSpeak_KEY}`);
    res.json(response.data.feeds);
  } catch (error) {
    console.error("Error fetching data from ThingSpeak:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.get("/datas", async (req, res) => {
  res.render("datas");
});

app.get("/reservoirData", async (req, res) => {
  try {
    const reservoirData = await Reservoir.find({});
    res.render("reservoirData", { reservoirData });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.post(
  "/admin",
  catchAsync(async (req, res) => {
    const { name, address, address2 } = req.body;
    const location = new Location({ name, address, address2 });
    await location.save();
    res.rekakao.maps.event.addListener(marker, "click", function () {
      let clickedLocation = locations[locationIndex];

      document.querySelector("#reservoirDetailTable tr:nth-child(1) td").textContent = clickedLocation.name;
      document.querySelector("#reservoirDetailTable tr:nth-child(4) td").textContent = clickedLocation.address;

      marker.setImage("http://map.daum.net/map_2dhd.png", new kakao.maps.Size(24, 35));
    });
    direct("/");
  })
);

app.get("/userData", async (req, res) => {
  try {
    const users = await User2.find({}); // 모든 사용자 데이터 조회
    res.render("userData", { user2Data: users }); // EJS 템플릿에 데이터 전달
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.get("/settings", async (req, res) => {
  res.render("settings");
});

app.put("/settings", async (req, res) => { });

//routing search
app.get("/search", async (req, res) => {
  const query = req.query;
  try {
    const searchedRsv = await Reservoir.find({ name: query.search });

    //no matching rsv name
    if (result.length == 0) {
      console.log("search failed");
      req.flash("error", "일치하는 지점이름이 없습니다");
      // res.redirect("/");
    } else {
      //matching rsv name
      // res.json(result);
      console.log("search complete");
      res.render("searchedRsv", { searchedRsv });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

//routing new reservoir data
app.post("/reservoirData", async (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}년 ${month}월 ${day}일`;

  try {
    // data from form
    const {
      name,
      manageId,
      address,
      rsvType,
      lvlDead,
      lvlHigh,
      lvlFlood,
      height,
      valQuan,
      senseP,
      senseC,
      lvlC,
      incharge,
      mac,
      phone,
      commInterver,
      actuWait,
      actuTime,
      registerDate,
    } = req.body;

    // create new reservoir instance
    const newReservoir = new Reservoir({
      name,
      manageId,
      address,
      rsvType: rsvType === "1" ? "수문 제어" : "수위 모니터링",
      lvlDead,
      lvlHigh,
      lvlFlood,
      height,
      valQuan,
      senseP,
      senseC,
      lvlC,
      incharge,
      mac,
      phone,
      commInterver,
      actuWait,
      actuTime,
      registerDate: formattedDate,
    });

    // save in db
    await newReservoir.save();

    res.redirect("/reservoirData");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// passport 적용 모르겠음
// app.post(
//   "/userData",
//   catchAsync(async (req, res, next) => {
//     try {
//       const { inputName, inputCompany, inputPhone, inputAddress, inputUserName, inputPassword, selectUserType, inchargedReservoir } = req.body;
//       const newUser = new User2({
//         inputName,
//         inputCompany,
//         inputPhone,
//         inputAddress,
//         inputUserName,
//         inputPassword,
//         selectUserType,
//         inchargedReservoir
//       });
//       const registeredUser = await User2.register(newUser, inputPassword);
//       await registeredUser.save();
//       res.redirect("/userData");
//     } catch (e) {
//       req.flash("error", e.message);
//       res.redirect("/userData");
//     }
//   })
// );

// save userData.ejs data
app.post("/userData", async (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}년 ${month}월 ${day}일`;
  try {
    const { inputName, inputCompany, inputPhone, inputAddress, inputUserName, inputPassword, selectUserType, inchargedReservoir, registerDate } = req.body;
    // create new reservoir instance
    const newUser = new User2({
      inputName,
      inputCompany,
      inputPhone,
      inputAddress,
      inputUserName,
      inputPassword,
      selectUserType: selectUserType === "1" ? "관리자" : "일반 사용자",
      inchargedReservoir,
      registerDate: formattedDate,
    });

    // save in db
    await newUser.save();
    res.redirect("/userData");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});


//res.redirect("/reservoirData");이 안되는데 왜그럴까
app.delete('/deleteRsvData', async (req, res) => {
  try {
    const idsToDelete = req.body.ids;
    await Reservoir.deleteMany({ _id: { $in: idsToDelete } });
    // res.status(200).send('Deleted successfully');
    res.redirect("/reservoirData");
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.delete('/deleteUserData', async (req, res) => {
  try {
    const idsToDelete = req.body.ids;
    await User2.deleteMany({ _id: { $in: idsToDelete } });
    res.status(200).send('Delete complete');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.listen(3000, () => {
  console.log("serving on port 3000");
});
