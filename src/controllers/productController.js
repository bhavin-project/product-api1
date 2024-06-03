import fs from "fs";
import path from "path";
import multer from "multer";
import { log } from "console";

const dataPath = path.join(path.resolve(), "data/product.json");
const imagePath = path.join(path.resolve(), "public/images");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagePath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage }).single("productImage");

const getProductsData = () => {
  if (!fs.existsSync(dataPath)) {
    return [];
  }
  const jsonData = fs.readFileSync(dataPath);
  return JSON.parse(jsonData);
};

const saveProductsData = (data) => {
  const stringifyData = JSON.stringify(data, null, 2);
  fs.writeFileSync(dataPath, stringifyData);
};

const validateProductData = (data) => {
  const { productId, productName, productDescription, isActive } = data;
  const errors = {};
  if (!productId) errors.productId = "Product ID must be provided.";
  if (!productName) errors.productName = "Product Name must be provided.";
  if (!productDescription) errors.productDescription = "Product Description must be provided.";
  if (isActive === undefined || isActive === null) errors.isActive = "Product Active status must be provided.";
  return errors;
};

export const insertProduct = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    const { productId, productName, productDescription, isActive } = req.body;

    const validationErrors = validateProductData({ productId, productName, productDescription, isActive });
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).send(validationErrors);
    }

    const products = getProductsData();
    const newProduct = {
      productId,
      productName,
      productDescription,
      productImage: req.file ? `/public/images/${req.file.filename}` : "",
      isActive,
    };
    products.push(newProduct);
    saveProductsData(products);
    res.status(201).send(newProduct);
  });
};

export const getProductById = (req, res) => {
  const products = getProductsData();
  const product = products.find((p) => p.productId === req.params.productId);
  if (product) {
    res.status(200).send(product);
  } else {
    res.status(404).send({ message: "Product not found" });
  }
};

export const getActiveProducts = (req, res) => {
  const products = getProductsData();
  const activeProducts = products.filter((p) => p.isActive);
  const limitedActiveProducts = activeProducts.slice(0, 5);

  if (limitedActiveProducts.length === 0) {
    return res.status(200).send([]);
  }

  res.status(200).send(limitedActiveProducts);
};

export const updateProduct = (req, res) => {
  const products = getProductsData();
  const productIndex = products.findIndex(
    (p) => p.productId === req.params.productId
  );
  if (productIndex === -1) {
    return res.status(404).send({ message: "Product not found" });
  }

  const updatedProduct = {
    ...products[productIndex],
    ...req.body,
  };

  const validationErrors = validateProductData(updatedProduct);
  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).send(validationErrors);
  }

  products[productIndex] = updatedProduct;
  saveProductsData(products);
  res.status(200).send(updatedProduct);
};

export const deleteProduct = (req, res) => {
  let products = getProductsData();
  products = products.filter((p) => p.productId !== req.params.productId);
  saveProductsData(products);
  res.status(204).send();
};
