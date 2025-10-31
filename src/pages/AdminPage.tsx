import { Box, Card, Container, Tab, Tabs } from '@mui/material';
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { search_order } from "../api/orders";
import { search_prod } from "../api/products";
import { search_users } from "../api/users";
import Aprove from "../components/admin/AprovSellerUser";
import AproveProd from "../components/admin/AprovSellerUserProduct";
import Categories from "../components/admin/Categories";
import Orders from "../components/admin/Orders";
import Products from "../components/admin/Products";
import Units from "../components/admin/Units";
import Users from "../components/admin/Users";

const AdminPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [search, setSearch] = useState("");

  const { data } = useQuery({
    queryKey: ["products", search],
    queryFn: () => {
      if (search && selectedTab === 1) {
        return search_prod(search);
      }
      return { products: [] };
    },
  });

  const { data: users } = useQuery({
    queryKey: ["users", search],
    queryFn: () => {
      if (search && selectedTab === 3) {
        return search_users(search);
      }
      return { users: [] };
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["orders", search],
    queryFn: () => {
      if (search && selectedTab === 2) {
        return search_order(search);
      }
      return { orders: [] };
    },
  });

  return (
    <>
      <section style={{ minHeight: '80vh' }} className="dark:bg-gray-900">

        <div className="mb-4">
          <h4 className='card-name-light'>Gestión administrativa</h4>
          <h6 className='card-subname-light'>Gestiona productos, ordenes e incluso usuarios</h6>
        </div>
        <Card sx={{ p: 4 }}>

          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            sx={{
              mb: 3,
              '& .Mui-selected': { color: '#39A900' },
              '& .MuiTabs-indicator': { backgroundColor: '#39A900' },
            }}
          >
            <Tab className="focus:outline-none" sx={{
              '&.Mui-selected': { color: '#39A900' },
            }} label="Productos" />
            <Tab className="focus:outline-none" sx={{
              '&.Mui-selected': { color: '#39A900' },
            }} label="Ordenes" />
            <Tab className="focus:outline-none" sx={{
              '&.Mui-selected': { color: '#39A900' },
            }} label="Usuarios" />
            <Tab className="focus:outline-none" sx={{
              '&.Mui-selected': { color: '#39A900' },
            }} label="Solicitudes Vendedor" />
            <Tab className="focus:outline-none" sx={{
              '&.Mui-selected': { color: '#39A900' },
            }} label="Nuevos productos" />
            <Tab className="focus:outline-none" sx={{
              '&.Mui-selected': { color: '#39A900' },
            }} label="Categorías" />
            <Tab className="focus:outline-none" sx={{
              '&.Mui-selected': { color: '#39A900' },
            }} label="Unidades" />
          </Tabs>

          <Box>
            {selectedTab === 0 && <Products results={data} />}
            {selectedTab === 1 && <Orders results={orders} />}
            {selectedTab === 2 && <Users results={users} />}
            {selectedTab === 3 && <Aprove results={data} />}
            {selectedTab === 4 && <AproveProd results={data} />}
            {selectedTab === 5 && <Categories />}
            {selectedTab === 6 && <Units />}
          </Box>
        </Card>
      </section>

    </>
  );
};

export default AdminPage;
