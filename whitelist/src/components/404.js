import Link from "next/link";

export default function FourNotFour() {
  return (
    <div className="container px-4 mx-auto">
      <section className="px-4 py-8 text-center">
        <div className="mx-auto max-w-auto">
          <div className="mx-auto md:max-w-lg">
            <svg
              className="text-gray-300 fill-current"
              viewBox="0 0 445 202"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M137.587 154.953h-22.102V197h-37.6v-42.047H.53v-33.557L72.36 2.803h43.125V124.9h22.102v30.053zM77.886 124.9V40.537L28.966 124.9h48.92zm77.49 72.1c.36-14.016 3.37-26.818 9.03-38.408 5.48-13.028 18.417-26.818 38.812-41.373 17.7-12.668 29.154-21.742 34.365-27.223 7.996-8.535 11.994-17.879 11.994-28.031 0-8.266-2.29-15.139-6.873-20.62-4.582-5.48-11.14-8.22-19.676-8.22-11.68 0-19.63 4.357-23.853 13.072-2.426 5.032-3.863 13.028-4.313 23.989h-37.33c.63-16.622 3.639-30.053 9.03-40.295C176.804 10.394 194.997.646 221.142.646c20.664 0 37.105 5.728 49.324 17.183 12.219 11.455 18.328 26.616 18.328 45.483 0 14.465-4.313 27.313-12.938 38.543-5.66 7.458-14.958 15.768-27.896 24.932l-15.363 10.916c-9.614 6.828-16.195 11.77-19.743 14.824a43.443 43.443 0 00-8.962 10.647h85.306V197H155.376zm153.498 0c.36-14.016 3.37-26.818 9.03-38.408 5.48-13.028 18.417-26.818 38.812-41.373 17.7-12.668 29.154-21.742 34.365-27.223 7.996-8.535 11.994-17.879 11.994-28.031 0-8.266-2.29-15.139-6.873-20.62-4.582-5.48-11.14-8.22-19.676-8.22-11.68 0-19.63 4.357-23.853 13.072-2.426 5.032-3.863 13.028-4.313 23.989h-37.33c.63-16.622 3.639-30.053 9.03-40.295C330.302 10.394 348.495.646 374.64.646c20.664 0 37.105 5.728 49.324 17.183 12.219 11.455 18.328 26.616 18.328 45.483 0 14.465-4.312 27.313-12.938 38.543-5.66 7.458-14.958 15.768-27.896 24.932l-15.363 10.916c-9.614 6.828-16.195 11.77-19.743 14.824a43.443 43.443 0 00-8.962 10.647h85.306V197H308.874z"
                fillRule="nonzero"
              />
            </svg>
          </div>
          <h2 className="mt-8 text-xl font-black uppercase lg:text-5xl">
            The change you wanted was rejected.
          </h2>
          <p className="mt-6 text-sm text-gray-900 uppercase lg:text-base">
            Maybe you tried to change something you did not have access to. <br /> If you are the
            application owner check the logs for more information.
          </p>
          <Link passHref href="/">
            <a className="inline-block px-6 py-4 mt-6 font-light text-white uppercase bg-blue-500 rounded-full shadow-md hover:bg-blue-700">
              {" "}
              Back To Homepage
            </a>
          </Link>
        </div>
      </section>
    </div>
  );
}
