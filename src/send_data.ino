#include <WiFi.h>
#include <FirebaseESP32.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <time.h>

// Thông tin WiFi
const char* ssid = "Huawei 2.4G";
const char* password = "hoithangdao";

// Thông tin Firebase
FirebaseConfig config;
FirebaseAuth auth;

// Khởi tạo cảm biến MPU6050
Adafruit_MPU6050 mpu;

// Khởi tạo đối tượng Firebase
FirebaseData firebaseData;

// Hàm cập nhật thời gian từ máy chủ NTP
void updateTime() {
  configTime(7 * 3600, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("Đang đợi đồng bộ hóa thời gian...");
  while (time(nullptr) < 86400) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("Thời gian đã được đồng bộ!");
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");

  // Cài đặt thông tin Firebase
  config.host = "testpart1912-default-rtdb.asia-southeast1.firebasedatabase.app";
  config.api_key = "AIzaSyA0PXrHtVLNX8BplXbT_G2zFwXZ0VUsM4Q";
  auth.user.email = "use2@gmail.com";
  auth.user.password = "123456";

  // Kết nối với Firebase
  Firebase.begin(&config, &auth);

  // Khởi tạo MPU6050
  if (!mpu.begin()) {
    Serial.println("Không tìm thấy chip MPU6050");
    while (1) {
      delay(10);
    }
  }

  // Đồng bộ hóa thời gian
  updateTime();
}

void loop() {
  // Đọc dữ liệu từ MPU6050
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  // Tạo đối tượng JSON
  FirebaseJson json;
  json.set("data/accelX", a.acceleration.x);
  json.set("data/accelY", a.acceleration.y);
  json.set("data/accelZ", a.acceleration.z);
  json.set("data/temperature", temp.temperature);

  // Lấy thời gian hiện tại
  time_t now = time(nullptr);
  struct tm timeinfo;
  localtime_r(&now, &timeinfo);
  char dateTime[64];
  strftime(dateTime, sizeof(dateTime), "%F %T", &timeinfo); // Định dạng YYYY-MM-DD HH:MM:SS
  json.set("data/time", dateTime);

    // Convert timeinfo to Unix timestamp (seconds since epoch)
  time_t timestamp = mktime(&timeinfo);
  json.set("data/timestamp", static_cast<int>(timestamp)); 

  // Gửi dữ liệu lên Firebase
  if (Firebase.pushJSON(firebaseData, "/mpuData", json)) {
    Serial.println("Gửi dữ liệu thành công!");
  } else {
    Serial.println("Gửi dữ liệu thất bại");
  }

  delay(1000); // Thời gian chờ giữa các lần gửi dữ liệu
}
