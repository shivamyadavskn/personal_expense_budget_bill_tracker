import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid"
import { ChevronDownIcon } from "@heroicons/react/16/solid"

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Account Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your profile information and preferences.
          </p>
        </div>

        <form className="space-y-8">
          {/* Profile Section */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
              <p className="mt-1 text-sm text-gray-500">
                This information will be displayed publicly so be careful what you share.
              </p>
            </div>

            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-x-6">
                <UserCircleIcon aria-hidden="true" className="size-20 text-gray-300" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Profile photo</h3>
                  <p className="mt-1 text-xs text-gray-500">JPG, PNG or GIF. 1MB max.</p>
                  <button
                    type="button"
                    className="mt-3 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Change photo
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="cover-photo" className="block text-sm font-medium text-gray-900">
                  Cover photo
                </label>
                <div className="mt-2 flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 transition-colors hover:border-gray-400 hover:bg-gray-50/50">
                  <div className="text-center">
                    <PhotoIcon aria-hidden="true" className="mx-auto size-12 text-gray-400" />
                    <div className="mt-4 flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 transition-colors"
                      >
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              <p className="mt-1 text-sm text-gray-500">
                Use a permanent address where you can receive mail.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="first-name" className="block text-sm font-medium text-gray-900">
                  First name
                </label>
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  autoComplete="given-name"
                  className="mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="last-name" className="block text-sm font-medium text-gray-900">
                  Last name
                </label>
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  autoComplete="family-name"
                  className="mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                />
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="country" className="block text-sm font-medium text-gray-900">
                  Country
                </label>
                <div className="relative mt-2">
                  <select
                    id="country"
                    name="country"
                    autoComplete="country-name"
                    className="block w-full appearance-none rounded-lg border-0 bg-white py-2 pl-3.5 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>Mexico</option>
                  </select>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="street-address" className="block text-sm font-medium text-gray-900">
                  Street address
                </label>
                <input
                  id="street-address"
                  name="street-address"
                  type="text"
                  autoComplete="street-address"
                  className="mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="city" className="block text-sm font-medium text-gray-900">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  className="mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="region" className="block text-sm font-medium text-gray-900">
                  State / Province
                </label>
                <input
                  id="region"
                  name="region"
                  type="text"
                  autoComplete="address-level1"
                  className="mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="postal-code" className="block text-sm font-medium text-gray-900">
                  ZIP / Postal code
                </label>
                <input
                  id="postal-code"
                  name="postal-code"
                  type="text"
                  autoComplete="postal-code"
                  className="mt-2 block w-full rounded-lg border-0 bg-white px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm transition-shadow"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-x-4 pt-4">
            <button
              type="button"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
