<div align="center">

  <h1>⚡ UniRide AWS Configuration</h1>
  
  <p>
    <b>Backend and hardwaare setup required for UniRide System.</b>
  </p>
  
  <h4>
    <a href="#-about">About</a> •
    <a href="#-requiremnts">Requirements</a> •
    <a href="#-dynamodb-setup">DynamoDB Setup</a> •
    <a href="#-lambda-functions">Lambda Functions</a> •
    <a href="#-iam-setup">IAM SetUp</a> •
    <a href="#-api-gateway">API Gateway</a> •
  </h4>
</div>

<br />

## ✨  About

This repository contains the initial setup required for the **UniRide** front-end (web and mobile applications) to work properly.

| Project | Repository |
|---|---|
|  UniRide | [lynx7843/UniRide](https://github.com/lynx7843/UniRide) |
|  UniRide Mobile | [lynx7843/UniRide_mobile](https://github.com/lynx7843/UniRide_mobile) |
|  UniRide Client | [lynx7843/UniRide_client](https://github.com/lynx7843/UniRide_client) |

## 🧾 Requirements

* AWS Cloud Server Account
* ESP32 Dev Board
* Neo 6M GPS Module
* AS608 Fingerprint Sensor
* Active-Low Buzzer Module
* Jumper Wires
* USB Data Cable

## 📖 DynamoDB Setup

<P>
   Manually Create the following tables with the listed strcture in the given json files. All other attributes required by the tables will be auto-filled with the use of lambda functions or hardware module.
</p>

* Bookings
```bash
{
  "bookingId": {
    "S": ""
  }
}
````

* DriverDetails
```bash
{
  "driverId": {
    "S": ""
  }
}
````

* DriverFingerprints
```bash
{
  "driverId": {
    "S": ""
  }
}
````

* DriverVerification
```bash
{
  "trackerId": {
    "S": ""
  },
  "timestamp": {
    "N": "0"
  }
}
````

* GPSTrackerData
```bash
{
  "deviceId": {
    "S": ""
  },
  "timestamp": {
    "N": "0"
  }
}
````

* ShuttleDetails
```bash
{
  "shuttleId": {
    "S": ""
  }
}
````

* ShuttleStatus
```bash
{
  "shuttleId": {
    "S": ""
  }
}
````

* ShuttleStops
```bash
{
  "shuttleId": {
    "S": ""
  }
}
````

* Staff
```bash
{
  "email": {
    "S": ""
  }
}
````

* Users
```bash
{
  "email": {
    "S": ""
  }
}
````

