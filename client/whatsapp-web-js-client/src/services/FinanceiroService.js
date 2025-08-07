import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_URL || 'http://localhost:3001';

// Configurar axios para sempre enviar cookies
axios.defaults.withCredentials = true;

// Serviço para Expenses
export const ExpensesService = {
  // Buscar todas as despesas
  getExpenses: async (schema) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/expenses/get-expenses/${schema}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      throw error;
    }
  },

  // Criar nova despesa
  createExpense: async (expenseData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/expenses/create-expense`, expenseData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      throw error;
    }
  }
};

// Serviço para Categories
export const CategoriesService = {
  // Buscar todas as categorias
  getCategories: async (schema) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/categories/get-categories/${schema}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  },

  // Criar nova categoria
  createCategory: async (categoryData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/categories/create-category`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }
};

// Serviço para Vendors
export const VendorsService = {
  // Buscar todos os fornecedores
  getVendors: async (schema) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/vendors/get-vendors/${schema}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      throw error;
    }
  },

  // Criar novo fornecedor
  createVendor: async (vendorData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/vendors/create-vendor`, vendorData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      throw error;
    }
  }
};

export default {
  ExpensesService,
  CategoriesService,
  VendorsService
}; 