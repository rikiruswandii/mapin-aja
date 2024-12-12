"use client"
import Head from "next/head";
import { useState, useEffect } from "react";
import { kml } from "@tmcw/togeojson";
import * as topojson from 'topojson-client';
import MapComponent from "./components/MapComponent";
import Header from "./components/NavComponent";
import GeojsonEditor from "./components/GeojsonEditor";
import { createNotification, Notification } from './components/Notification'; // Import createNotification

export default function Home() {
  const [geoJsonData, setGeoJsonData] = useState({
    type: "FeatureCollection",
    features: [],
  });

  const handleGeoJSONChange = (updatedGeoJSON) => {
    setGeoJsonData(updatedGeoJSON);
  };

  useEffect(() => {
    if (geoJsonData) {
      console.log("Updated GeoJSON data:", geoJsonData);
    }
  }, [geoJsonData]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const fileContent = reader.result;
          const fileName = file.name.toLowerCase();

          // Validasi berdasarkan ekstensi
          if (fileName.endsWith(".geojson")) {
            const data = JSON.parse(fileContent);
            setGeoJsonData(data);
            createNotification({
              type: 'success',
              message: `File ${file.name} berhasil diunggah.`,
              title: 'Upload Berhasil',
            });
          } else if (fileName.endsWith(".kml")) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(fileContent, "application/xml");

            const converted = kml(xmlDoc);
            setGeoJsonData(converted);
            createNotification({
              type: 'info',
              message: `KML file ${file.name} successfully converted to GeoJSON.`,
              title: 'Konversi Berhasil',
            });
          } else if (fileName.endsWith(".topojson")) {
            const topojsonData = JSON.parse(fileContent);
            const geojsonData = topojson.feature(topojsonData, topojsonData.objects[Object.keys(topojsonData.objects)[0]]);
            setGeoJsonData(geojsonData);
            createNotification({
              type: 'warning',
              message: `TopoJSON file ${file.name} is uploaded. Check the GeoJSON.`,
              title: 'Peringatan',
            });
          } else {
            console.error("Unsupported file format");
            createNotification({
              type: 'error',
              message: `Unsupported file format ${file.name}. Please upload a GeoJSON, KML, or TopoJSON file.`,
              title: 'Error',
            });
          }
        } catch (error) {
          console.error("Invalid file", error);
          createNotification({
            type: 'error',
            message: 'Error parsing the file. Please check the format.',
            title: 'Error',
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <Head>
        <title>Mapin Aja</title>
        <meta name="description">Web for geospatial viewer.</meta>
      </Head>
      <Header onFileUpload={handleFileUpload} Download={geoJsonData} />
      <main className="h-[665px] w-full lg:flex">
        <MapComponent
          geoJsonData={geoJsonData}
          onGeoJSONChange={handleGeoJSONChange}
        />
        <GeojsonEditor
          initialGeoJSON={geoJsonData}
          onChange={handleGeoJSONChange}
        />
      </main>
      <Notification /> {/* Menambahkan komponen notifikasi */}
    </div>
  );
}

