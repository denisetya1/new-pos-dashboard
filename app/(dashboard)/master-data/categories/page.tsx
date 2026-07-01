import MasterDataPage from "../components/MasterDataPage";

const CategoriesPage = () => {
  return (
    <MasterDataPage
      config={{
        type: "categories",
        title: "Master Kategori",
        addLabel: "Tambah Kategori",
        nameLabel: "Nama Kategori",
        searchPlaceholder: "Cari kategori",
        hasDescription: true,
      }}
    />
  );
};

export default CategoriesPage;
