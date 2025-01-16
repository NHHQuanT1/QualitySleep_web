const { db } = require("../firebase");
const { database } = require("../firebase");

const { Router } = require("express");
const router = Router();
const data = database.ref("mpuData");
let results = [];

//TEST hàm tính kq

// Hàm tính Mean of Acceleration (A)
function calculateMeanAcceleration(data) {
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
}

// Hàm tính Mean of Absolute Difference (MAD)
function calculateMAD(data, mean) {
  const sum = data.reduce((acc, val) => acc + Math.abs(val - mean), 0);
  return sum / data.length;
}

// Hàm tính Posture Difference (ΔP)
function calculatePostureDifference(meanY, meanZ, prevMeanY, prevMeanZ) {
  return Math.pow(meanY - prevMeanY, 2) + Math.pow(meanZ - prevMeanZ, 2);
}

// Route để lấy dữ liệu, tính toán và lưu vào Firestore
router.get('/viewdatas', async (req, res, next) => {
  const { startTime, endTime } = req.query;

  // Kiểm tra startTime và endTime có hợp lệ không
  if (!startTime || !endTime || isNaN(startTime) || isNaN(endTime)) {
    return res.status(400).send("Invalid startTime or endTime.");
  }

  // Chuyển đổi startTime và endTime từ string sang number
  const startTimestamp = parseInt(startTime, 10);
  const endTimestamp = parseInt(endTime, 10);

  try {
    const date = `resAnalysis_${startTimestamp}`; // Giac ngu ngay 15 tuc la tu 21h ngay 15 đến 7h sáng ngày 16
    const resAnalysisCollection = db.collection(date);
    const resAnalysisSnapshot = await resAnalysisCollection.get();
    if (!resAnalysisSnapshot.empty) {
      const resAnalysisList = resAnalysisSnapshot.docs.map(doc => doc.data());
      console.log(resAnalysisList.length);
      resAnalysisList.sort((a,b) => a.id - b.id);
      this.results = resAnalysisList;
      // res.json(results);
      res.render("index");
      // return this.results;
    }
    else{

    // Lấy dữ liệu từ Firebase trong khoảng thời gian được chỉ định
    const snapshot = await data
      .orderByChild('data/timestamp')
      .startAt(startTimestamp)
      .endAt(endTimestamp)
      .once('value');

    const values = snapshot.val();

    // Kiểm tra xem có dữ liệu không
    if (!values) {
      return res.status(404).send("No data available in the specified timestamp range.");
    }

    // Khởi tạo mảng để lưu dữ liệu gia tốc
    const accelerationData = [];
    const date_time = startTimestamp;
    // Lặp qua dữ liệu và lấy giá trị gia tốc trục Y và Z
    Object.keys(values).forEach(key => {
      const entry = values[key].data;
      accelerationData.push([entry.accelY, entry.accelZ]); // Lấy giá trị trục Y và Z
    });

    const n = 20; // Số lượng mẫu trong một epoch
    let prevMeanY = 0;
    let prevMeanZ = 0;

    // Mảng để lưu kết quả tính toán
    // const results = [];
    const promises = [];

    // Tạo tên collection động dựa trên startTimestamp
    const collectionName = `resAnalysis_${startTimestamp}`;

    // Xử lý dữ liệu theo từng epoch
    for (let i = 0; i < accelerationData.length; i += n) {
      const epochData = accelerationData.slice(i, i + n);
      const yData = epochData.map(data => data[0]);
      const zData = epochData.map(data => data[1]);

      const meanY = calculateMeanAcceleration(yData);
      const meanZ = calculateMeanAcceleration(zData);

      const madY = calculateMAD(yData, meanY);
      const madZ = calculateMAD(zData, meanZ);

      const deltaP = calculatePostureDifference(meanY, meanZ, prevMeanY, prevMeanZ);

      // Lưu kết quả vào Firestore
      const promise = db.collection(collectionName).add({
        id: Math.floor(i / n),
        timestamp: date_time,
        meanY: meanY,
        meanZ: meanZ,
        madY: madY,
        madZ: madZ,
        deltaP: deltaP
      }).catch(error => {
        console.error("Error writing to Firestore:", error);
        throw error;
      });

      promises.push(promise);
      this.results =[];
      // Lưu kết quả vào mảng để trả về cho client
      this.results.push({
        id: Math.floor(i / n),
        timestamp: date_time,
        meanY: meanY,
        meanZ: meanZ,
        madY: madY,
        madZ: madZ,
        deltaP: deltaP
      });

      prevMeanY = meanY;
      prevMeanZ = meanZ;
    }

    // Đợi tất cả các promise hoàn thành
    await Promise.all(promises);
    

    // Trả về kết quả cho client
    // res.json(results);
    res.render("index");


  } 
}
    catch (error) {
    console.error("Error processing data:", error);
    next(error);
  }
});

// Tinh ket qua chat luong giac ngu
//Ham tim dinh tren thap nhat
function findU(Udelta, pre, cur, next){
  if(cur >= Udelta){
    return Udelta;
  }
  if( cur > pre && cur > next){
    return cur;
  }
  return Udelta;
};

router.get("/caculator", async (req, res) => {
  // console.log(this.results.length);
  let UdeltaP = 100.0;
  let UmadY = 5.0;
  let UmadZ = 5.0;

  temp = this.results;
  // console.log(UdeltaP,' ', UmadY, ' ',UmadZ );
  // Loop only up to the third-to-last element
  for (let i = 0; i < temp.length - 2; i++) {
    // console.log(temp[i]);
    UdeltaP = findU(UdeltaP, temp[i].deltaP, temp[i+1].deltaP, temp[i+2].deltaP);
    UmadY = findU(UmadY, temp[i].madY, temp[i+1].madY, temp[i+2].madY);
    UmadZ = findU(UmadZ, temp[i].madZ, temp[i+1].madZ, temp[i+2].madZ);
    // console.log(UdeltaP,' ', UmadY, ' ',UmadZ );
  }
  console.log(UdeltaP,' ', UmadY, ' ',UmadZ );

  //Tìm các điểm cơ thể chuyển động
  const moveBody = [];
  let count_move_body = 0;
  for (let i = 0; i < temp.length; i++) {
    if(temp[i].deltaP> UdeltaP && temp[i].madY > UmadY && temp[i].madZ > UmadZ){
      //Số điểm (m)-epoch phát hiện cơ thể đã được chuyển động lưu vào mảng
      moveBody.push(i);
      count_move_body ++;
    }
  };
  console.log(moveBody); 
  console.log(count_move_body);

  // Đưa ra kết quả đánh giá cuối cùng
  if (moveBody.length === 0){
    console.log('Giac ngu ngon 100%');
  }
  else {
    //Tim nhung thoi diem goi la lightsleep
    let count_light_sleep = 0;
    const total_sleep = temp.length;
    let quality_sleep;
    for (let i = 1; i < moveBody.length; i++){
      if (moveBody[i] - moveBody[i-1] < 60) count_light_sleep ++;
    }
  quality_sleep = Math.round((1-(count_light_sleep/total_sleep)) * 100) / 100;
  console.log(quality_sleep);
  }
});


router.get("/", async (req, res) => {
  res.render("index");
});

module.exports = router;
