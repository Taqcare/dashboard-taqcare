
import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  DollarSign,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Receipt,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  type: 'employee' | 'company';
  role: string;
  salary: number;
  email: string;
  phone: string;
  address: string;
  startDate: string;
  status: 'active' | 'inactive';
  paymentDay: number;
  lastPayment?: string;
  companyDetails?: {
    companyName: string;
    cnpj: string;
    serviceDescription: string;
  };
}

interface EmployeeFormData extends Omit<Employee, 'id'> {
  id?: number;
}

const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "João Silva",
    type: "employee",
    role: "Customer Service",
    salary: 2500,
    email: "joao@example.com",
    phone: "(11) 98765-4321",
    address: "Rua A, 123 - São Paulo, SP",
    startDate: "2024-01-15",
    status: "active",
    paymentDay: 5,
    lastPayment: "2024-03-05"
  },
  {
    id: 2,
    name: "Tech Solutions LTDA",
    type: "company",
    role: "IT Services",
    salary: 5000,
    email: "contact@techsolutions.com",
    phone: "(11) 3456-7890",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    startDate: "2023-11-01",
    status: "active",
    paymentDay: 15,
    lastPayment: "2024-03-15",
    companyDetails: {
      companyName: "Tech Solutions LTDA",
      cnpj: "12.345.678/0001-90",
      serviceDescription: "IT infrastructure and support"
    }
  }
];

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeFormData | null>(null);
  const [selectedType, setSelectedType] = useState<'employee' | 'company'>('employee');

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isPaymentDue = (employee: Employee) => {
    const today = new Date();
    const currentDay = today.getDate();
    const lastPaymentDate = employee.lastPayment ? new Date(employee.lastPayment) : null;
    
    if (!lastPaymentDate) return true;
    
    const lastPaymentMonth = lastPaymentDate.getMonth();
    const currentMonth = today.getMonth();
    const lastPaymentYear = lastPaymentDate.getFullYear();
    const currentYear = today.getFullYear();
    
    // Payment is due if:
    // 1. We're in a new month and haven't paid yet
    // 2. We're in the same month but on or after the payment day
    return (currentYear > lastPaymentYear) ||
           (currentYear === lastPaymentYear && currentMonth > lastPaymentMonth) ||
           (currentYear === lastPaymentYear && currentMonth === lastPaymentMonth && currentDay >= employee.paymentDay);
  };

  const handlePayment = (employeeId: number) => {
    setEmployees(employees.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          lastPayment: new Date().toISOString().split('T')[0]
        };
      }
      return emp;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    if (editingEmployee.id) {
      // Update existing employee
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id ? { ...editingEmployee as Employee } : emp
      ));
    } else {
      // Add new employee
      setEmployees([...employees, { 
        ...editingEmployee,
        id: Math.max(...employees.map(e => e.id)) + 1
      } as Employee]);
    }

    setShowModal(false);
    setEditingEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setSelectedType(employee.type);
    setShowModal(true);
  };

  const handleDelete = (employeeId: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== employeeId));
    }
  };

  return (
    <div className="p-3 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Employees & Service Providers</h1>
        <button
          onClick={() => {
            setEditingEmployee({
              name: '',
              type: selectedType,
              role: '',
              salary: 0,
              email: '',
              phone: '',
              address: '',
              startDate: new Date().toISOString().split('T')[0],
              status: 'active',
              paymentDay: 5
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full md:w-auto justify-center md:justify-start"
        >
          <Plus className="h-5 w-5" />
          Add New
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  {employee.type === 'employee' ? (
                    <User className="h-6 w-6 text-gray-600" />
                  ) : (
                    <Building2 className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{employee.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {employee.type === 'employee' ? 'Employee' : 'Service Provider'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0 self-end md:self-auto">
                {isPaymentDue(employee) ? (
                  <button 
                    onClick={() => handlePayment(employee.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                  >
                    <DollarSign className="h-4 w-4" />
                    Pay Now
                  </button>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    Paid
                  </span>
                )}
                <button 
                  onClick={() => handleEdit(employee)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-50"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleDelete(employee.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium text-gray-900">{employee.role}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(employee.salary)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-600">Payment Day:</span>
                  <span className="font-medium text-gray-900">Day {employee.paymentDay}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Receipt className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-600">Last Payment:</span>
                  <span className="font-medium text-gray-900">
                    {employee.lastPayment ? formatDate(employee.lastPayment) : 'Not paid yet'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900 break-all">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{employee.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium text-gray-900">{employee.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium text-gray-900">{formatDate(employee.startDate)}</span>
                </div>
              </div>
            </div>

            {employee.type === 'company' && employee.companyDetails && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Company Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-gray-600">Company Name:</span>
                      <span className="font-medium text-gray-900">{employee.companyDetails.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Receipt className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-gray-600">CNPJ:</span>
                      <span className="font-medium text-gray-900">{employee.companyDetails.cnpj}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm">
                      <span className="text-gray-600">Service Description:</span>
                      <p className="mt-1 font-medium text-gray-900">{employee.companyDetails.serviceDescription}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isPaymentDue(employee) && (
              <div className="mt-6 p-3 md:p-4 bg-yellow-50 rounded-lg flex items-start md:items-center gap-2 text-yellow-800 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 md:mt-0" />
                <span>Payment is due! Next payment date: Day {employee.paymentDay}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingEmployee?.id ? 'Edit' : 'Add New'} {selectedType === 'employee' ? 'Employee' : 'Service Provider'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingEmployee(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 md:gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setSelectedType('employee')}
                  className={`flex-1 py-2 px-3 md:px-4 rounded-lg text-sm md:text-base ${
                    selectedType === 'employee'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('company')}
                  className={`flex-1 py-2 px-3 md:px-4 rounded-lg text-sm md:text-base ${
                    selectedType === 'company'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Service Provider
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedType === 'company' ? 'Company Name' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={editingEmployee?.name || ''}
                    onChange={(e) => setEditingEmployee(prev => ({ ...prev!, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={editingEmployee?.role || ''}
                    onChange={(e) => setEditingEmployee(prev => ({ ...prev!, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Payment (R$)
                  </label>
                  <input
                    type="number"
                    value={editingEmployee?.salary || ''}
                    onChange={(e) => setEditingEmployee(prev => ({ ...prev!, salary: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editingEmployee?.paymentDay || ''}
                    onChange={(e) => setEditingEmployee(prev => ({ ...prev!, paymentDay: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingEmployee?.email || ''}
                    onChange={(e) => setEditingEmployee(prev => ({ ...prev!, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editingEmployee?.phone || ''}
                    onChange={(e) => setEditingEmployee(prev => ({ ...prev!, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editingEmployee?.address || ''}
                    onChange={(e) => setEditingEmployee(prev => ({ ...prev!, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {selectedType === 'company' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CNPJ
                      </label>
                      <input
                        type="text"
                        value={editingEmployee?.companyDetails?.cnpj || ''}
                        onChange={(e) => setEditingEmployee(prev => ({
                          ...prev!,
                          companyDetails: {
                            ...prev?.companyDetails!,
                            cnpj: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Description
                      </label>
                      <textarea
                        value={editingEmployee?.companyDetails?.serviceDescription || ''}
                        onChange={(e) => setEditingEmployee(prev => ({
                          ...prev!,
                          companyDetails: {
                            ...prev?.companyDetails!,
                            serviceDescription: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col md:flex-row md:justify-end gap-3 md:gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEmployee(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg w-full md:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full md:w-auto"
                >
                  {editingEmployee?.id ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
