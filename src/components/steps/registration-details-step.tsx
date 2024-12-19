import { PRICE_CONFIG } from "@/lib/constants";

interface RegistrationDetailsStepProps {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export function RegistrationDetailsStep({
  register,
  errors,
  watch,
  setValue,
  onNext,
  onBack,
}: RegistrationDetailsStepProps) {
  const registrationType = watch("registration_type");

  return (
    <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Registration Details
      </h2>

      {/* Registration Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(PRICE_CONFIG).map(([type, config]) => {
          return (
            <div
              key={type}
              className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                registrationType === type
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setValue("registration_type", type)}
            >
              <config.icon className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{type}</h3>
              <p className="text-gray-600 text-sm mb-3">{config.description}</p>
              <p className="text-blue-600 font-semibold">
                Rs. {config.price.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            {...register("full_name")}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
          {errors.full_name && (
            <p className="mt-2 text-sm text-red-600">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Mobile Number
          </label>
          <input
            type="tel"
            {...register("mobile_number")}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+977XXXXXXXXXX"
          />
          {errors.mobile_number && (
            <p className="mt-2 text-sm text-red-600">
              {errors.mobile_number.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Qualification
          </label>
          <select
            {...register("qualification")}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select qualification</option>
            <option value="Under SEE">Under SEE</option>
            <option value="10+2">10+2</option>
            <option value="Graduate">Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
          </select>
          {errors.qualification && (
            <p className="mt-2 text-sm text-red-600">
              {errors.qualification.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Gender
          </label>
          <select
            {...register("gender")}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && (
            <p className="mt-2 text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Age
          </label>
          <input
            type="number"
            {...register("age")}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your age"
          />
          {errors.age && (
            <p className="mt-2 text-sm text-red-600">{errors.age.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            {...register("address")}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your address"
          />
          {errors.address && (
            <p className="mt-2 text-sm text-red-600">
              {errors.address.message}
            </p>
          )}
        </div>
      </div>

      {/* Group Members Section (if Group registration type) */}
      {registrationType === "Group" && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Group Members</h3>
          <p className="text-gray-600 mb-6">
            Please provide details for 5 group members. All fields are required.
          </p>

          <div className="space-y-8">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-lg mb-4">
                  Member {index + 1}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      {...register(`group_members.${index}.name`)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter member's full name"
                    />
                    {errors.group_members?.[index]?.name && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.group_members[index].name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      {...register(`group_members.${index}.email`)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="member@example.com"
                    />
                    {errors.group_members?.[index]?.email && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.group_members[index].email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      {...register(`group_members.${index}.mobile_number`)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+977XXXXXXXXXX"
                    />
                    {errors.group_members?.[index]?.mobile_number && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.group_members[index].mobile_number.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      {...register(`group_members.${index}.address`)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter member's address"
                    />
                    {errors.group_members?.[index]?.address && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.group_members[index].address.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Qualification
                    </label>
                    <select
                      {...register(`group_members.${index}.qualification`)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select qualification</option>
                      <option value="Under SEE">Under SEE</option>
                      <option value="10+2">10+2</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Post Graduate">Post Graduate</option>
                    </select>
                    {errors.group_members?.[index]?.qualification && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.group_members[index].qualification.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      {...register(`group_members.${index}.gender`)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.group_members?.[index]?.gender && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.group_members[index].gender.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      {...register(`group_members.${index}.age`)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter member's age"
                      min="10"
                    />
                    {errors.group_members?.[index]?.age && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.group_members[index].age.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() =>
            onNext({
              registration_type: registrationType,
              full_name: watch("full_name"),
              email: watch("email"),
              mobile_number: watch("mobile_number"),
              qualification: watch("qualification"),
              gender: watch("gender"),
              age: watch("age"),
              address: watch("address"),
              group_members:
                registrationType === "Group"
                  ? watch("group_members")
                  : undefined,
            })
          }
          className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Next Step
        </button>
      </div>
    </section>
  );
}
