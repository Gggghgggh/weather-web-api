import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Banknote,
  Building2,
  Coffee,
  Cross,
  Fuel,
  GraduationCap,
  Hotel,
  LoaderCircle,
  MapPin,
  Pill,
  RefreshCw,
  Shield,
  ShoppingBasket,
  Stethoscope,
  Utensils,
} from 'lucide-react';


const CATEGORY_CONFIG = {
  hospital: {
    label: 'Hospitals',
    icon: Cross,
  },

  pharmacy: {
    label: 'Pharmacies',
    icon: Pill,
  },

  police: {
    label: 'Police',
    icon: Shield,
  },

  school: {
    label: 'Schools',
    icon: GraduationCap,
  },

  restaurant: {
    label: 'Restaurants',
    icon: Utensils,
  },

  fuel: {
    label: 'Fuel',
    icon: Fuel,
  },

  atm: {
    label: 'ATMs',
    icon: Banknote,
  },

  hotel: {
    label: 'Hotels',
    icon: Hotel,
  },

  clinic: {
    label: 'Clinics',
    icon: Stethoscope,
  },

  bank: {
    label: 'Banks',
    icon: Building2,
  },

  cafe: {
    label: 'Cafés',
    icon: Coffee,
  },

  supermarket: {
    label: 'Supermarkets',
    icon: ShoppingBasket,
  },
};


function NearbyPlacesPanel({
  selectedLocation,
  onPlacesChange,
}) {
  const [
    places,
    setPlaces,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState('');


  const [
    activeCategory,
    setActiveCategory,
  ] = useState('all');


  async function loadPlaces() {
    if (!selectedLocation) {
      return;
    }


    setLoading(true);
    setError('');


    try {
      const params =
        new URLSearchParams({
          lat:
            selectedLocation
              .latitude
              .toString(),

          lon:
            selectedLocation
              .longitude
              .toString(),

          radius: '2500',
        });


      const response =
        await fetch(
          `/api/nearby?${params.toString()}`
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.detail ||
          'Unable to load nearby places.'
        );
      }


      const results =
        data.places || [];


      setPlaces(results);


      onPlacesChange?.(
        results
      );

    } catch (requestError) {
      setPlaces([]);


      onPlacesChange?.([]);


      setError(
        requestError.message ||
        'Nearby places are temporarily unavailable.'
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    setPlaces([]);

    setActiveCategory(
      'all'
    );

    onPlacesChange?.([]);


    if (selectedLocation) {
      loadPlaces();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedLocation?.latitude,
    selectedLocation?.longitude,
  ]);


  const availableCategories =
    useMemo(() => {
      const categories =
        new Set(
          places.map(
            (place) =>
              place.category
          )
        );


      return Object
        .entries(
          CATEGORY_CONFIG
        )
        .filter(
          ([category]) =>
            categories.has(
              category
            )
        );

    }, [
      places,
    ]);


  const visiblePlaces =
    activeCategory ===
    'all'
      ? places
      : places.filter(
          (place) =>
            place.category ===
            activeCategory
        );


  if (!selectedLocation) {
    return (
      <section className="premium-card rounded-3xl border p-5">

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="secondary-text text-[10px] font-semibold uppercase tracking-[0.16em]">
              Around you
            </p>

            <h2 className="primary-text mt-1 text-lg font-semibold">
              Nearby places
            </h2>

          </div>


          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">

            <MapPin
              size={17}
            />

          </div>

        </div>


        <div className="empty-state mt-5 rounded-2xl border p-5">

          <p className="primary-text text-xs font-semibold">
            Choose a location
          </p>

          <p className="secondary-text mt-2 text-[10px] leading-5">
            Select a place on the map to discover hospitals, pharmacies, schools, restaurants and other useful places nearby.
          </p>

        </div>

      </section>
    );
  }


  return (
    <section className="premium-card rounded-3xl border p-5">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>

          <p className="secondary-text text-[10px] font-semibold uppercase tracking-[0.16em]">
            Around this location
          </p>

          <h2 className="primary-text mt-1 text-lg font-semibold">
            Nearby places
          </h2>

          <p className="secondary-text mt-1 text-xs">
            Useful places within approximately 2.5 km.
          </p>

        </div>


        <button
          type="button"
          onClick={
            loadPlaces
          }
          disabled={
            loading
          }
          className="nav-action flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold"
        >

          {loading
            ? (
              <LoaderCircle
                size={14}
                className="animate-spin"
              />
            )
            : (
              <RefreshCw
                size={14}
              />
            )
          }

          Refresh

        </button>

      </div>


      {/* CATEGORY FILTERS */}

      {!loading &&
        !error &&
        places.length >
        0 && (
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">

            <button
              type="button"
              onClick={() =>
                setActiveCategory(
                  'all'
                )
              }
              className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-semibold transition ${
                activeCategory ===
                'all'
                  ? 'map-layer-option-active'
                  : 'secondary-text'
              }`}
            >
              All ({places.length})
            </button>


            {availableCategories.map(
              ([
                category,
                config,
              ]) => {
                const Icon =
                  config.icon;


                const count =
                  places.filter(
                    (place) =>
                      place.category ===
                      category
                  ).length;


                return (
                  <button
                    key={
                      category
                    }
                    type="button"
                    onClick={() =>
                      setActiveCategory(
                        category
                      )
                    }
                    className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-semibold transition ${
                      activeCategory ===
                      category
                        ? 'map-layer-option-active'
                        : 'secondary-text'
                    }`}
                  >

                    <Icon
                      size={12}
                    />

                    <span>
                      {
                        config.label
                      }
                    </span>

                    <span>
                      {count}
                    </span>

                  </button>
                );
              }
            )}

          </div>
        )}


      {/* LOADING */}

      {loading && (
        <div className="mt-6 flex min-h-[180px] items-center justify-center">

          <div className="text-center">

            <LoaderCircle
              size={24}
              className="mx-auto animate-spin text-sky-500"
            />

            <p className="primary-text mt-4 text-xs font-semibold">
              Discovering nearby places
            </p>

            <p className="secondary-text mt-1 text-[10px]">
              Looking around the selected location…
            </p>

          </div>

        </div>
      )}


      {/* ERROR */}

      {!loading &&
        error && (
          <div className="error-banner mt-5 rounded-2xl border p-4">

            <p className="text-xs font-semibold">
              Nearby places unavailable
            </p>

            <p className="mt-1 text-[10px] leading-5">
              {error}
            </p>

          </div>
        )}


      {/* EMPTY */}

      {!loading &&
        !error &&
        places.length ===
        0 && (
          <div className="empty-state mt-5 rounded-2xl border p-5">

            <p className="primary-text text-xs font-semibold">
              No nearby places found
            </p>

            <p className="secondary-text mt-2 text-[10px] leading-5">
              We could not find matching places around this location. Try selecting another area.
            </p>

          </div>
        )}


      {/* RESULTS */}

      {!loading &&
        !error &&
        visiblePlaces.length >
        0 && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {visiblePlaces.map(
              (place) => {
                const config =
                  CATEGORY_CONFIG[
                    place.category
                  ];


                const Icon =
                  config?.icon ||
                  MapPin;


                return (
                  <article
                    key={
                      place.id
                    }
                    className="weather-stat group rounded-2xl border p-4 transition"
                  >

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">

                        <Icon
                          size={16}
                        />

                      </div>


                      <div className="min-w-0 flex-1">

                        <p className="primary-text line-clamp-2 text-xs font-semibold leading-5">
                          {
                            place.name
                          }
                        </p>


                        <p className="secondary-text mt-1 text-[9px]">
                          {
                            config
                              ?.label ||
                            place
                              .category_label ||
                            place
                              .category
                          }
                        </p>

                      </div>

                    </div>


                    <div className="mt-4 flex items-center gap-2">

                      <MapPin
                        size={12}
                        className="shrink-0 text-sky-500"
                      />

                      <span className="primary-text text-[10px] font-semibold">
                        {
                          place
                            .distance_km
                        } km away
                      </span>

                    </div>


                    {place.address && (
                      <p className="secondary-text mt-3 line-clamp-2 text-[9px] leading-4">
                        {
                          place.address
                        }
                      </p>
                    )}


                    {place.opening_hours && (
                      <div className="mt-3 border-t pt-3">

                        <p className="secondary-text text-[8px] uppercase tracking-[0.1em]">
                          Opening hours
                        </p>

                        <p className="primary-text mt-1 line-clamp-2 text-[9px] font-medium">
                          {
                            place
                              .opening_hours
                          }
                        </p>

                      </div>
                    )}

                  </article>
                );
              }
            )}

          </div>
        )}


      {/* RESULT COUNT */}

      {!loading &&
        !error &&
        visiblePlaces.length >
        0 && (
          <div className="mt-5 flex items-center justify-between border-t pt-4">

            <p className="secondary-text text-[9px]">

              Showing{' '}

              <span className="primary-text font-semibold">
                {
                  visiblePlaces.length
                }
              </span>

              {' '}
              {
                activeCategory ===
                'all'
                  ? 'nearby places'
                  : (
                    CATEGORY_CONFIG[
                      activeCategory
                    ]?.label ||
                    'places'
                  )
              }

            </p>


            <p className="secondary-text text-[9px]">
              Within 2.5 km
            </p>

          </div>
        )}

    </section>
  );
}


export default NearbyPlacesPanel;