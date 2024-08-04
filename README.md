# REST API Server Penaly

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/300px-Node.js_logo.svg.png" />
</p>

## Perkenalan

Assalamualaikum, perkenalkan saya Andy Rahman Ramadhan dan ini adalah project tugas UAS kuliah saya dimana saya membuat server dengan menggunakan
framework Express by NodeJS dan di tujuan project ini adalah untuk membuat sebuah REST API untuk mengelola backend dari website Penaly, website ini 
masih tahap pembuatan jadi maklum masih ada sebagian bug yang perlu diperbaiki, tapi insyaallah akan saya selesaikan denga cepat. Terima Kasih.

## Instalasi

Berikut cara kita menginstall server ini:

```bash
git clone https://github.com/andyrhman/node-shop.git
cd node-admin
npm install
```

## Pengaturan & Konfigurasi Pertama Kali

Buat direktori:

```bash
mkdir node-admin
npm init -y
```

Instal beberapa dependensi:

```bash
npm i -D typescript ts-node nodemon

Ignore this if you have installed typescript globally

npm i -g typescript
```

Konfigurasi Typescript:

```bash
tsc --init
```

Buat file bernama `nodemon.json` dan salin kode ini

```json
{
    "ignore": [
      ".git",
      "node_modules/",
      "dist/",
      "coverage/"
    ],
    "watch": [
      "src/*"
    ],
    "ext": "js,json,ts"
  }
```

## Requirements

Prasyarat dan dependensi yang diperlukan untuk menjalankan server ini adalah misalnya:
- Node.js versi 18+ (No pun intended)
- npm atau yarn
- Database Postgres versi 13+