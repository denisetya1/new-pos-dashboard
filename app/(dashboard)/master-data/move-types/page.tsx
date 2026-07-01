import MasterDataPage from "../components/MasterDataPage";

const MoveTypesPage = () => {
  return (
    <MasterDataPage
      config={{
        type: "move-types",
        title: "Master Jenis Perpindahan Stok",
        addLabel: "Tambah Jenis",
        nameLabel: "Nama Jenis",
        searchPlaceholder: "Cari jenis perpindahan stok",
        hasDirection: true,
      }}
    />
  );
};

export default MoveTypesPage;
