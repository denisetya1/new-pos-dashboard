import MasterDataPage from "../components/MasterDataPage";

const BrandsPage = () => {
  return (
    <MasterDataPage
      config={{
        type: "brands",
        title: "Master Brand",
        addLabel: "Tambah Brand",
        nameLabel: "Nama Brand",
        searchPlaceholder: "Cari brand",
        hasDescription: true,
      }}
    />
  );
};

export default BrandsPage;
