import { GoogleMap, LoadScript } from "@react-google-maps/api";

function Map() {
  const mapStyles = {
    height: "100vh",
    width: "100%",
  };

  const defaultCenter = {
    lat: 41.3851,
    lng: 2.1734,
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyCNZA1EGmdrQjxZDXegY7K1EuWaJ-kSCL8">
      <GoogleMap mapContainerStyle={mapStyles} zoom={10} center={defaultCenter}>
        {/* Other map components or markers go here */}
      </GoogleMap>
    </LoadScript>
  );
}

export default Map;
