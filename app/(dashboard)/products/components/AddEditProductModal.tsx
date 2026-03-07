"use client";

import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "../../components/Modal";
import { ProductFormValues, productSchema } from "@/app/schemas/productSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiOutlinePencil } from "react-icons/hi";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type UserFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
  test?: string;
};

const AddEditProductForm = ({ onSuccess, onCancel }: UserFormProps) => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    console.log("FORM DATA:", values);

    // contoh submit API
    // await fetch("/api/users", { method:"POST", body: JSON.stringify(values) })
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priceTagLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama di Label Harga</FormLabel>
                <FormControl>
                  <Input placeholder="Nama di Label Harga" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih brand" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih brand" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="SKU" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode</FormLabel>
                <FormControl>
                  <Input placeholder="Barcode" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onCancel?.()}>
            Batal
          </Button>

          <Button type="submit">Simpan</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const AddEditProductModal = ({ onSuccess, onCancel, test }: UserFormProps) => {
  return (
    <Modal
      title="Edit Produk"
      trigger={
        <Button variant="outline">
          <HiOutlinePencil className="text-primary-600" />
        </Button>
      }
      tooltipText="Edit Produk"
    >
      <AddEditProductForm />
    </Modal>
  );
};

export default AddEditProductModal;
