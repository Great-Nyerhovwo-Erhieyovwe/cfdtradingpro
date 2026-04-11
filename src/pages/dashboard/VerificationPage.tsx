import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";
import { Modal } from "../../components/Modal/Modal";
import { Loading } from "../../components/Loading/Loading";

const backendUrl = import.meta.env.VITE_API_URL;

const VerificationPageContent: React.FC = () => {
  // STATE
  const [documentType, setDocumentType] = useState<string>("passport");
  const [documentNumber, setDocumentNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", type: "info" });

  const [recentVerifications, setRecentVerifications] = useState<Array<any>>([]);

  // DOCUMENT TYPES
  const docTypes = [
    { value: "passport", label: "Passport" },
    { value: "drivers_license", label: "Driver's License" },
    { value: "national_id", label: "National ID" },
    { value: "visa", label: "Visa" },
  ];

  // FETCH DATA ON MOUNT
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        window.location.href = '/login';
        return;
      }

      try {
        const [userRes, verificationsRes] = await Promise.all([
          fetch(`${backendUrl}/api/dashboard/user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}/api/requests/verifications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const user = await userRes.json();
        const verifications = await verificationsRes.json();

        // Set full name from user
        if (user) {
          setFullName(
            `${user.firstName || ""} ${user.lastName || ""}`.trim() || ""
          );
        }

        // Set recent verifications
        if (verifications.success && verifications.verifications) {
          const sorted = verifications.verifications.sort(
            (a: any, b: any) =>
              new Date(b.requestedAt).getTime() -
              new Date(a.requestedAt).getTime()
          );
          setRecentVerifications(sorted.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // VALIDATE FORM
  const validateForm = (): string | null => {
    if (!fullName.trim()) return "Please enter your full name";
    if (!documentType) return "Please select a document type";
    if (!documentNumber.trim()) return "Please enter document number";
    if (!expiryDate) return "Please enter expiry date";

    // Validate expiry date is in future
    const expiry = new Date(expiryDate);
    if (expiry < new Date()) return "Document must not be expired";

    return null;
  };

  // SUBMIT VERIFICATION REQUEST
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setModal({
        isOpen: true,
        title: "Validation Error",
        message: error,
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const response = await fetch(`${backendUrl}/api/requests/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentType,
          documentNumber,
          expiryDate,
          fullName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setModal({
          isOpen: true,
          title: "Verification Submitted",
          message: `Your ${docTypes.find((d) => d.value === documentType)?.label} verification has been submitted. Our team will review and approve within 24-48 hours.`,
          type: "success",
        });

        // Reset form
        setDocumentNumber("");
        setExpiryDate("");

        // Refresh verification history
        setTimeout(() => {
          const token = localStorage.getItem("token");
          if (token) {
            fetch(`${backendUrl}/api/requests/verifications`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((r) => r.json())
              .then((d) => {
                if (d.success && d.verifications) {
                  const sorted = d.verifications.sort(
                    (a: any, b: any) =>
                      new Date(b.requestedAt).getTime() -
                      new Date(a.requestedAt).getTime()
                  );
                  setRecentVerifications(sorted.slice(0, 5));
                }
              });
          }
        }, 1000);
      } else {
        setModal({
          isOpen: true,
          title: "Submission Failed",
          message: data.message || "Failed to submit verification request",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: "Failed to submit verification request",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading isLoading={true} message="Loading verification page..." />;
  }

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="space-y-6">
      <Loading isLoading={isSubmitting} message="Submitting verification..." />
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Identity Verification</h1>
        <p className="text-gray-600 mt-2">
          Verify your identity to unlock full platform access
        </p>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
        <p className="text-sm text-orange-800">
          ⚠️ KYC verification is required to withdraw funds. Submit your valid government-issued ID to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Submit Verification
          </h2>

          <form onSubmit={handleSubmitVerification} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name (as on document)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {docTypes.map((doc) => (
                  <option key={doc.value} value={doc.value}>
                    {doc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Number
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="e.g., A12345678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Document Upload Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                📄 Ensure all details match your document exactly. Clear, legible scans are required.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!documentNumber || !expiryDate || isSubmitting}
              className="w-full px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit for Verification"}
            </button>
          </form>

          {/* Document Requirements */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Document Requirements:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Must be a valid government-issued ID</li>
              <li>• Must not be expired</li>
              <li>• All fields must be clearly visible</li>
              <li>• No filters or edits allowed</li>
            </ul>
          </div>
        </div>

        {/* Verification History */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Verification History
          </h2>
          <div className="space-y-3">
            {recentVerifications.length > 0 ? (
              recentVerifications.map((verification) => (
                <div
                  key={verification._id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {docTypes.find((d) => d.value === verification.documentType)
                          ?.label || verification.documentType}
                      </p>
                      <p className="text-sm text-gray-600">
                        {verification.documentNumber}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        verification.status
                      )}`}
                    >
                      {verification.status
                        .charAt(0)
                        .toUpperCase() + verification.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(verification.requestedAt).toLocaleDateString()}
                  </p>
                  {verification.adminNotes && (
                    <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                      {verification.adminNotes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-6">
                No verification requests yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const VerificationPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      window.location.href = '/login'
      return;
    }

    fetch(`${backendUrl}/api/dashboard/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setUserProfile({
            name: `${d.firstName || ""} ${d.lastName || ""}`.trim() || "User",
            email: d.email || "",
            isVerified: d.emailVerified || false,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <DashboardLayout user={userProfile || { name: "User", email: "" }}>
      <VerificationPageContent />
    </DashboardLayout>
  );
};

export default VerificationPage;
