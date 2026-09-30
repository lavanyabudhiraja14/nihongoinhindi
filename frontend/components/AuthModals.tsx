'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, getDeckCards } from '@/lib/storage';

export default function AuthModals() {
  const { pendingMerge, confirmPendingMerge, cancelPendingMerge, unsyncedWarningModal } = useAuth();
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const handleExportGuestData = () => {
    try {
      const exportData = {
        profile: getUserProfile(),
        cards: getDeckCards(),
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nihongo_guest_progress_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export guest data:', err);
    }
  };

  return (
    <>
      {/* Merge Confirmation Dialog */}
      {pendingMerge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] border border-[#E8E8EC] p-6 max-w-[460px] w-full shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {!showDiscardConfirm ? (
              <>
                <div>
                  <h3 className="text-[20px] font-semibold text-[#0D1B4B] font-hindi leading-tight">
                    स्थानीय सीखने का डेटा जोड़ें?
                  </h3>
                  <p className="text-[13px] text-[#5B6070] mt-0.5">
                    Merge local progress with your account
                  </p>
                </div>

                <p className="text-[15px] text-[#0D1B4B]/80 font-hindi leading-relaxed">
                  इस डिवाइस पर आपकी <span className="font-semibold text-[#FF9933]">{pendingMerge.guestCompletionsCount}</span> गतिविधियां और प्रगति मौजूद हैं। क्या आप इन्हें अपने खाते में जोड़ना चाहते हैं?
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={confirmPendingMerge}
                    className="flex-1 py-2.5 px-4 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] text-white text-[15px] font-semibold font-hindi transition cursor-pointer"
                  >
                    हां, जोड़ें
                    <span className="block text-[11px] font-normal text-white/80">Yes, Merge</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDiscardConfirm(true)}
                    className="flex-1 py-2.5 px-4 rounded-[8px] bg-[#F4F4F6] hover:bg-[#E8E8EC] text-[#0D1B4B] text-[15px] font-medium font-hindi transition cursor-pointer"
                  >
                    खाते का डेटा उपयोग करें
                    <span className="block text-[11px] font-normal text-[#5B6070]">Use Account Data</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-[20px] font-semibold text-[#BC2025] font-hindi leading-tight">
                    स्थानीय डेटा हटाने की पुष्टि
                  </h3>
                  <p className="text-[13px] text-[#5B6070] mt-0.5">
                    Discard Guest Progress Confirmation
                  </p>
                </div>

                <p className="text-[15px] text-[#0D1B4B]/80 font-hindi leading-relaxed">
                  खाते का डेटा उपयोग करने पर इस डिवाइस का स्थानीय गेस्ट प्रोग्रेस हमेशा के लिए हटा दिया जाएगा। क्या आप पहले बैकअप डाउनलोड करना चाहते हैं?
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleExportGuestData}
                    className="w-full py-2 px-4 rounded-[8px] border border-[#0D1B4B] text-[#0D1B4B] hover:bg-[#0D1B4B]/5 text-[14px] font-medium font-hindi transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>JSON बैकअप डाउनलोड करें</span>
                    <span className="text-[12px] text-[#5B6070]">(Download Backup)</span>
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDiscardConfirm(false);
                        cancelPendingMerge();
                      }}
                      className="flex-1 py-2.5 px-4 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] text-white text-[14px] font-semibold font-hindi transition cursor-pointer"
                    >
                      हटाएं और जारी रखें
                      <span className="block text-[11px] font-normal text-white/80">Discard & Continue</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDiscardConfirm(false)}
                      className="flex-1 py-2.5 px-4 rounded-[8px] bg-[#F4F4F6] hover:bg-[#E8E8EC] text-[#0D1B4B] text-[14px] font-medium font-hindi transition cursor-pointer"
                    >
                      वापस जाएं
                      <span className="block text-[11px] font-normal text-[#5B6070]">Go Back</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Unsynced Changes Logout Warning Modal */}
      {unsyncedWarningModal && unsyncedWarningModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] border border-[#E8E8EC] p-6 max-w-[440px] w-full shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-[20px] font-semibold text-[#BC2025] font-hindi leading-tight">
                असुरक्षित प्रगति की चेतावनी
              </h3>
              <p className="text-[13px] text-[#5B6070] mt-0.5">
                Unsynced Progress Warning
              </p>
            </div>

            <p className="text-[15px] text-[#0D1B4B]/80 font-hindi leading-relaxed">
              आपकी हाल की कुछ प्रगति अभी सर्वर पर सिंक नहीं हुई है (या आप ऑफ़लाइन हैं)। यदि आप अभी लॉग आउट करते हैं, तो असिंक्ड स्थानीय प्रगति हटा दी जाएगी।
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={unsyncedWarningModal.onConfirm}
                className="flex-1 py-2.5 px-4 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] text-white text-[15px] font-semibold font-hindi transition cursor-pointer"
              >
                फिर भी लॉग आउट करें
                <span className="block text-[11px] font-normal text-white/80">Log Out Anyway</span>
              </button>
              <button
                type="button"
                onClick={unsyncedWarningModal.onCancel}
                className="flex-1 py-2.5 px-4 rounded-[8px] bg-[#F4F4F6] hover:bg-[#E8E8EC] text-[#0D1B4B] text-[15px] font-medium font-hindi transition cursor-pointer"
              >
                रद्द करें
                <span className="block text-[11px] font-normal text-[#5B6070]">Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
