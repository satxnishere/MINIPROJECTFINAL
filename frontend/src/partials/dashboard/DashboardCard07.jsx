import React from 'react';

function DashboardCard07() {
  return (
    <div className="col-span-full xl:col-span-8 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Top Referral Sources</h2>
      </header>
      <div className="p-3">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full dark:text-gray-300">
            {/* Table header */}
            <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 dark:bg-opacity-50 rounded-sm">
              <tr>
                <th className="p-2">
                  <div className="font-semibold text-left">Source</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Visits</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Inquiries</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Clients</div>
                </th>
                <th className="p-2">
                  <div className="font-semibold text-center">Conversion</div>
                </th>
              </tr>
            </thead>
            {/* Table body */}
            <tbody className="text-sm font-medium divide-y divide-gray-100 dark:divide-gray-700/60">
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="flex items-center">
                    <svg className="shrink-0 mr-2 sm:mr-3" width="36" height="36" viewBox="0 0 36 36">
                      <circle fill="#4A90E2" cx="18" cy="18" r="18" />
                      <path d="M18 10l1.7 4.3h4.3l-3.4 2.5 1.3 4.2L18 18.4l-3.9 2.6 1.3-4.2-3.4-2.5h4.3z" fill="#FFF" />
                    </svg>
                    <div className="text-gray-800 dark:text-gray-100">NaplesLegalDirectory.com</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-center">3.1K</div>
                </td>
                <td className="p-2">
                  <div className="text-center">187</div>
                </td>
                <td className="p-2">
                  <div className="text-center">42</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">5.8%</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="flex items-center">
                    <svg className="shrink-0 mr-2 sm:mr-3" width="36" height="36" viewBox="0 0 36 36">
                      <circle fill="#1ED760" cx="18" cy="18" r="18" />
                      <path d="M24.5 15.1c-2.2-1.3-5.1-1.4-8.4-.8v.8c3.1-.6 5.9-.4 7.9.8v-0.8zm.4 1.8c-1.9-1.1-4.7-1.5-7.9-.9v.8c3-.5 5.7-.2 7.5.8v-0.7zm-8.3 3.5c2.6-.4 5.1-.2 6.8.7v-0.7c-1.9-1-4.5-1.2-7.2-.7v.7z" fill="#FFF" />
                    </svg>
                    <div className="text-gray-800 dark:text-gray-100">NaplesHomeServices.com</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-center">2.8K</div>
                </td>
                <td className="p-2">
                  <div className="text-center">152</div>
                </td>
                <td className="p-2">
                  <div className="text-center">38</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">5.4%</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="flex items-center">
                    <svg className="shrink-0 mr-2 sm:mr-3" width="36" height="36" viewBox="0 0 36 36">
                      <circle fill="#EA4335" cx="18" cy="18" r="18" />
                      <path d="M18 17v2.4h4.1c-.2 1-1.2 3-4 3-2.4 0-4.3-2-4.3-4.4 0-2.4 2-4.4 4.3-4.4 1.4 0 2.3.6 2.8 1.1l1.9-1.8C21.6 11.7 20 11 18.1 11c-3.9 0-7 3.1-7 7s3.1 7 7 7c4 0 6.7-2.8 6.7-6.8 0-.5 0-.8-.1-1.2H18z" fill="#FFF" fillRule="nonzero" />
                    </svg>
                    <div className="text-gray-800 dark:text-gray-100">Google (organic)</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-center">2.5K</div>
                </td>
                <td className="p-2">
                  <div className="text-center">143</div>
                </td>
                <td className="p-2">
                  <div className="text-center">36</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">5.2%</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="flex items-center">
                    <svg className="shrink-0 mr-2 sm:mr-3" width="36" height="36" viewBox="0 0 36 36">
                      <circle fill="#4BC9FF" cx="18" cy="18" r="18" />
                      <path d="M26 14.3c-.1 1.6-1.2 3.7-3.3 6.4-2.2 2.8-4 4.2-5.5 4.2-.9 0-1.7-.9-2.4-2.6C14 19.9 13.4 15 12 15c-.1 0-.5.3-1.2.8l-.8-1c.8-.7 3.5-3.4 4.7-3.5 1.2-.1 2 .7 2.3 2.5.3 2 .8 6.1 1.8 6.1.9 0 2.5-3.4 2.6-4 .1-.9-.3-1.9-2.3-1.1.8-2.6 2.3-3.8 4.5-3.8 1.7.1 2.5 1.2 2.4 3.3z" fill="#FFF" fillRule="nonzero" />
                    </svg>
                    <div className="text-gray-800 dark:text-gray-100">NaplesBusinessNetwork.com</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-center">2.2K</div>
                </td>
                <td className="p-2">
                  <div className="text-center">129</div>
                </td>
                <td className="p-2">
                  <div className="text-center">31</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">4.8%</div>
                </td>
              </tr>
              {/* Row */}
              <tr>
                <td className="p-2">
                  <div className="flex items-center">
                    <svg className="shrink-0 mr-2 sm:mr-3" width="36" height="36" viewBox="0 0 36 36">
                      <circle fill="#0E2439" cx="18" cy="18" r="18" />
                      <path d="M14.232 12.818V23H11.77V12.818h2.46zM15.772 23V12.818h2.462v4.087h4.012v-4.087h2.456V23h-2.456v-4.092h-4.012V23h-2.461z" fill="#E6ECF4" />
                    </svg>
                    <div className="text-gray-800 dark:text-gray-100">FloridaLegalForum.com</div>
                  </div>
                </td>
                <td className="p-2">
                  <div className="text-center">2.0K</div>
                </td>
                <td className="p-2">
                  <div className="text-center">118</div>
                </td>
                <td className="p-2">
                  <div className="text-center">29</div>
                </td>
                <td className="p-2">
                  <div className="text-center text-sky-500">4.6%</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardCard07;
