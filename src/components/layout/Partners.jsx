export default function Partners() {
  const partners = [
    {
      name: 'Vital Digital Media',
      logo: 'https://triklecamp.com/wp-content/uploads/2025/07/Vital-Digital-Media-edited.png',
      url: 'https://vitaldigitalmedia.net/',
      buttonText: 'Visit Site'
    },
    {
      name: 'Drip Emporium Store',
      logo: 'https://triklecamp.com/wp-content/uploads/2025/07/Drip-emporium-Logo.png',
      url: 'https://dripemporium.store',
      buttonText: 'Buy now'
    },
    {
      name: 'Muts Production',
      logo: 'https://triklecamp.com/wp-content/uploads/2025/07/Muts-Production-Logo.png',
      url: 'https://muts.dripemporium.store',
      buttonText: 'Shop now'
    },
    {
      name: 'sheng Mtaa',
      logo: 'https://triklecamp.com/wp-content/uploads/2025/07/Sheng-Mtaa.png',
      url: 'https://shengmtaa.com',
      buttonText: 'Chambua lugha'
    },
    {
      name: 'Blitz Secure Fast Delivery',
      logo: 'https://triklecamp.com/wp-content/uploads/2025/07/Blitz-Logo.png',
      url: 'https://blitzparcel.com/',
      buttonText: 'Visit site'
    },
    {
      name: 'Bainika Pods',
      logo: 'https://triklecamp.com/wp-content/uploads/2025/07/Bainika-Pods-Partner-Logo.png',
      url: 'https://x.com/bainikah78168',
      buttonText: 'Find us on X'
    },
    {
      name: 'Aperture Studios Hub',
      logo: 'https://triklecamp.com/wp-content/uploads/2025/07/Aperture-Media-Partner-Logo.png',
      url: 'https://www.linkedin.com/in/aperture-media-3a092425a',
      buttonText: 'Find us on LinkedIn'
    },
    {
      name: 'Mwakale Tours & Safaries',
      logo: 'https://triklecamp.com/wp-content/uploads/2025/07/Mwakale-Tours-Safaris-Partner-Logo.png',
      url: 'https://www.facebook.com/share/193z5R5hBs/',
      buttonText: 'Find us on Faceebook'
    }
  ];

  return (
    <div className="py-12 bg-white rounded-lg -mx-4 px-4">
      <h3 className="text-center text-xl font-bold text-gray-800 mb-8">Our Partners</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {partners.map((partner, index) => (
          <div key={index} className="flex flex-col items-center text-center space-y-4">
            <div className="w-full h-32 flex items-center justify-center bg-gray-50 rounded-lg p-4">
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
            <h6 className="text-gray-800 font-semibold text-sm">
              {partner.name}
            </h6>
            <a
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              {partner.buttonText}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
