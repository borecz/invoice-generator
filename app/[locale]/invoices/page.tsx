// This is a Server Component by default
import { getInvoicesForUser } from '@/app/invoices/actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoice_number: string;
  // customer_name: string; // Old field
  customers: { name: string } | null; // New structure for related customer
  invoice_date: string;
  total_amount: number;
  status: string;
}

const InvoicesPage = async () => {
  const { data: invoices, error } = await getInvoicesForUser();

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Error Fetching Invoices</h1>
          <p className="text-gray-700 mb-6">{error.message}</p>
          <Link href="/">
            <Button variant="outline">Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">No Invoices Found</h1>
          <p className="text-gray-700 mb-6">You haven&apos;t created any invoices yet.</p>
          <div className="space-y-4">
            <Link href="/new">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Create Your First Invoice
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">Go to Homepage</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h1 className="text-3xl font-bold text-gray-800">My Invoices</h1>
          <Link href="/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Create New Invoice
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {/* Add actions column if needed, e.g., View, Edit, Delete */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice: Invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoice_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.customers?.name || 'N/A'} {/* Access nested customer name */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invoice.invoice_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* Assuming total_amount is a number, format as currency if needed */}
                    {invoice.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      invoice.status === 'draft' ? 'bg-gray-200 text-gray-800' :
                      'bg-red-100 text-red-800' // for overdue or void
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
