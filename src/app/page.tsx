"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Calendar,
  Clock,
  RotateCcw,
  BookOpen,
  CalendarDays,
  LineChart,
  LayoutGrid,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Bold,
  Quote,
  Image as ImageIcon,
  ArrowDown,
  Smile,
  Leaf,
  Flower2,
  Droplets,
  Flame,
  User,
  Bell,
  MessageCircle,
  Bookmark,
  List,
  Trash2,
  Edit3,
  X,
  Loader2,
  FileText,
  Heart,
  ShieldCheck,
} from "lucide-react";

interface SentimentPercentages {
  joy: number;
  calm: number;
  flutter: number;
  sadness: number;
  stress: number;
}

interface AnalysisResult {
  dominantSentiment: "joy" | "calm" | "flutter" | "sadness" | "stress";
  dominantSentimentLabel: string;
  sentimentPercentages: SentimentPercentages;
  confidence: number;
  balanceTitle: string;
  positivityScore: number;
  emotionalStability: string;
  recoveryIndex: string;
  keywords: string[];
  empathyNote: string;
  mindfulQuote: string;
  quoteAuthor: string;
}

interface DiaryItem {
  timestamp: string;
  datetime: string;
  content: string;
}

export default function DiarySentimentPage() {
  // 목업 데이터 제거: 초기 제목과 본문은 빈 문자열로 시작
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const [writeTime, setWriteTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customApiKey, setCustomApiKey] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // 구글 시트 연동 상태
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [diaryList, setDiaryList] = useState<DiaryItem[]>([]);
  const [editingItem, setEditingItem] = useState<DiaryItem | null>(null);
  const [editContent, setEditContent] = useState("");

  // 로컬 스토리지에서 저장된 Gemini API 키 불러오기
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("GEMINI_USER_API_KEY");
      if (savedKey) {
        setCustomApiKey(savedKey);
      }
    } catch (e) {
      console.warn("Could not read localStorage:", e);
    }
  }, []);

  // 실시간 날짜 및 요일, 시간 포맷팅
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
      const dayName = dayNames[now.getDay()];

      setFormattedDate(`${year}년 ${month}월 ${date}일 ${dayName}`);

      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "오후" : "오전";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const formattedTime = `${ampm} ${displayHours}:${displayMinutes}`;
      setCurrentTime(formattedTime);
      if (!writeTime) {
        setWriteTime(`${formattedTime} 작성`);
      }
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, [writeTime]);

  // 글자 수 및 단어 수 계산
  const charCount = content.replace(/\s/g, "").length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // AI 분석 요청 핸들러
  const handleAnalyze = async () => {
    if (!content.trim()) {
      alert("일기 내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          customApiKey: customApiKey.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "분석 요청에 실패했습니다.");
      }

      setAnalysisResult(json.data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "분석 중 오류가 발생했습니다.");
      // API Key 미설정 에러일 경우 사용자의 편의를 위해 설정 모달 띄우기 권장
      if (err.message && err.message.includes("API 키")) {
        setShowApiKeyModal(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 시트에 일기 저장 (Create)
  const handleSaveToSheet = async () => {
    if (!content.trim()) {
      alert("저장할 일기 내용을 작성해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const datetimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      // 제목이 있을 경우 본문에 깔끔하게 포함하거나 내용 단독 전달
      const diaryContent = title.trim()
        ? `[${title.trim()}]\n\n${content.trim()}`
        : content.trim();

      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          content: diaryContent,
          datetime: datetimeString,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "구글 시트 저장에 실패했습니다.");
      }

      alert("구글 시트에 일기가 성공적으로 저장되었습니다!");
    } catch (err: any) {
      console.error("Save error:", err);
      alert(err.message || "저장 중 오류가 발생했습니다. .env.local 설정을 확인해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  // 구글 시트에서 일기 리스트 조회 (Read)
  const handleFetchList = async () => {
    setIsLoadingList(true);
    setShowListModal(true);
    try {
      const res = await fetch("/api/diary?action=read");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "일기 목록을 불러오지 못했습니다.");
      }
      setDiaryList(data.items || []);
    } catch (err: any) {
      console.error("Fetch list error:", err);
      alert(err.message || "목록 조회 중 오류가 발생했습니다. .env.local 설정을 확인해주세요.");
    } finally {
      setIsLoadingList(false);
    }
  };

  // 일기 삭제 (Delete)
  const handleDeleteDiary = async (timestamp: string) => {
    if (!confirm("이 일기를 삭제하시겠습니까?")) return;

    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          timestamp,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "삭제에 실패했습니다.");
      }
      setDiaryList((prev) => prev.filter((item) => item.timestamp !== timestamp));
      alert("일기가 삭제되었습니다.");
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  // 일기 수정 (Update)
  const handleUpdateDiary = async () => {
    if (!editingItem) return;
    if (!editContent.trim()) {
      alert("수정할 내용을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          timestamp: editingItem.timestamp,
          content: editContent.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "수정에 실패했습니다.");
      }
      setDiaryList((prev) =>
        prev.map((item) =>
          item.timestamp === editingItem.timestamp
            ? { ...item, content: editContent.trim() }
            : item
        )
      );
      setEditingItem(null);
      setEditContent("");
      alert("일기가 수정되었습니다.");
    } catch (err: any) {
      console.error("Update error:", err);
      alert(err.message || "수정 중 오류가 발생했습니다.");
    }
  };

  // 재시작 (초기화) 핸들러
  const handleReset = () => {
    if (confirm("일기 작성 내용을 모두 초기화하고 새로 시작할까요?")) {
      setTitle("");
      setContent("");
      setAnalysisResult(null);
      setErrorMessage(null);
      setWriteTime(`${currentTime} 작성`);
    }
  };

  // 감성 5종 정의
  const sentiments = [
    {
      id: "joy" as const,
      label: "기쁨",
      subLabel: "감사",
      icon: Smile,
      badgeColor: "bg-amber-400 text-amber-950",
      activeRing: "ring-4 ring-amber-400 bg-amber-50 shadow-md scale-105",
      defaultBg: "bg-amber-50/60 hover:bg-amber-100/60 text-amber-900 border-amber-200/60",
    },
    {
      id: "calm" as const,
      label: "차분",
      subLabel: "평온",
      icon: Leaf,
      badgeColor: "bg-[#7c3aed] text-white",
      activeRing: "ring-4 ring-[#7c3aed] bg-purple-50 shadow-md scale-105",
      defaultBg: "bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-900 border-emerald-200/60",
    },
    {
      id: "flutter" as const,
      label: "설렘",
      subLabel: "희망",
      icon: Flower2,
      badgeColor: "bg-pink-400 text-pink-950",
      activeRing: "ring-4 ring-pink-400 bg-pink-50 shadow-md scale-105",
      defaultBg: "bg-pink-50/60 hover:bg-pink-100/60 text-pink-900 border-pink-200/60",
    },
    {
      id: "sadness" as const,
      label: "슬픔",
      subLabel: "정화",
      icon: Droplets,
      badgeColor: "bg-sky-400 text-sky-950",
      activeRing: "ring-4 ring-sky-400 bg-sky-50 shadow-md scale-105",
      defaultBg: "bg-sky-50/60 hover:bg-sky-100/60 text-sky-900 border-sky-200/60",
    },
    {
      id: "stress" as const,
      label: "스트레스",
      subLabel: "긴장",
      icon: Flame,
      badgeColor: "bg-rose-500 text-white",
      activeRing: "ring-4 ring-rose-400 bg-rose-50 shadow-md scale-105",
      defaultBg: "bg-rose-50/60 hover:bg-rose-100/60 text-rose-900 border-rose-200/60",
    },
  ];

  const currentDominant = analysisResult?.dominantSentiment;

  return (
    <div className="min-h-screen bg-[#FAF7FD] text-[#1D1B20] font-sans antialiased flex flex-col items-center pb-24 md:pb-12">
      {/* 뷰 컨테이너 (최대 너비 480px) */}
      <div className="w-full max-w-[480px] bg-white min-h-screen shadow-xl flex flex-col relative border-x border-[#F0EBF5]">
        
        {/* 앱 상단 헤더 */}
        <header className="px-5 py-4 flex items-center justify-between border-b border-[#F5EEF9] sticky top-0 bg-white/90 backdrop-blur-md z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EDE7F6] text-[#6750A4] flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-5 h-5 fill-[#6750A4]" />
            </div>
            <div>
              <h1 className="text-[16px] font-bold tracking-tight text-[#1D1B20] leading-tight">
                Diary AI Sentiments Analyzer
              </h1>
              <p className="text-[11px] font-medium text-[#7C3AED] mt-0.5">마음챙김 감성 분석 AI</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="p-2 rounded-full hover:bg-[#F3EDF7] text-[#6750A4] transition-colors relative"
              title="Gemini API 키 설정"
            >
              <KeyRound className="w-4 h-4" />
              {customApiKey && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>
            <button className="p-2 rounded-full hover:bg-[#F3EDF7] text-[#49454F] transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#4F378A] text-white flex items-center justify-center text-xs font-semibold shadow-sm ml-1">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* 상단 날짜 및 요일 표시 */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3EDF7] text-[#4F378A] font-medium shadow-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate || "오늘의 날짜"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#006C4F] font-medium">
            <Clock className="w-3.5 h-3.5 text-[#006C4F]" />
            <span>{currentTime || "시간 확인 중"}</span>
          </div>
        </div>

        {/* 일기 작성 영역 */}
        <section className="px-5 py-2 flex flex-col gap-3">
          {/* 영역 상단 헤더 & 저장 / 일기보기 버튼 */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-[#49454F] tracking-tight">일기 작성</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveToSheet}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6750A4] hover:bg-[#523B8A] text-white text-xs font-medium transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                title="구글 시트에 일기 저장"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5" />
                )}
                <span>{isSaving ? "저장 중..." : "저장"}</span>
              </button>

              <button
                type="button"
                onClick={handleFetchList}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDE7F6] hover:bg-[#E1D5F5] text-[#4F378A] text-xs font-medium transition shadow-xs cursor-pointer active:scale-95 border border-[#D1C4E9]/60"
                title="구글 시트에 저장된 일기 목록 보기"
              >
                <List className="w-3.5 h-3.5 text-[#6750A4]" />
                <span>일기보기</span>
              </button>
            </div>
          </div>

          {/* 일기 제목 입력란 */}
          <div className="bg-[#FAF5FD] rounded-2xl p-3.5 border border-[#EADBDB]/50">
            <label className="text-[11px] font-semibold text-[#7C3AED] tracking-wide block mb-1">
              일기 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="오늘 하루를 한 줄로 표현해보세요..."
              className="w-full bg-transparent text-[15px] font-medium text-[#1D1B20] focus:outline-none placeholder-[#9C94A6]"
            />
          </div>

          {/* 일기 에디터 카드 */}
          <div className="bg-[#FAF7FC] rounded-3xl p-4 border border-[#ECE4F2] shadow-sm flex flex-col gap-3">
            {/* 툴바 & 작성 시간 표시 */}
            <div className="flex items-center justify-between pb-2 border-b border-[#EFE7F6] text-[#5B5566]">
              <div className="flex items-center gap-2">
                <button type="button" className="p-1 rounded hover:bg-[#EAE0F5] transition text-xs font-bold w-6 h-6 flex items-center justify-center">
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-[#EAE0F5] transition text-xs w-6 h-6 flex items-center justify-center">
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-[#EAE0F5] transition text-xs w-6 h-6 flex items-center justify-center">
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-[#EAE0F5] transition text-xs w-6 h-6 flex items-center justify-center">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#7A7582] font-medium">
                <Clock className="w-3 h-3 text-[#7C3AED]" />
                <span>{writeTime || "작성 중"}</span>
              </div>
            </div>

            {/* 본문 텍스트에어리어 */}
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 어떤 순간들이 당신의 마음에 머물렀나요? 자유롭게 당신의 이야기를 들려주세요..."
              className="w-full bg-transparent text-[14px] leading-relaxed text-[#2B2733] focus:outline-none resize-none placeholder-[#ABA5B4]"
            />

            {/* 감성 무드 사진 미리보기 (2개 카드) */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="relative h-28 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-700/80 to-amber-200/50 flex items-end p-2.5 shadow-xs group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/40 via-amber-900/60 to-black/80"></div>
                <span className="relative z-10 text-[11px] font-semibold text-white/95 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
                  따뜻한 쉼
                </span>
              </div>
              <div className="relative h-28 rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-900 to-rose-400 flex items-end p-2.5 shadow-xs group">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-300/40 via-purple-900/60 to-black/80"></div>
                <span className="relative z-10 text-[11px] font-semibold text-white/95 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
                  퇴근길 노을
                </span>
              </div>
            </div>

            {/* 에디터 하단 메타정보 */}
            <div className="flex items-center justify-between pt-2 border-t border-[#EFE7F6] text-xs text-[#7A7582]">
              <div className="flex items-center gap-1.5 text-[#006C4F] font-medium text-[11px]">
                <Leaf className="w-3.5 h-3.5" />
                <span>마음의 여백을 담는 중</span>
              </div>
              <div className="text-[11px] font-semibold">
                <span className="text-[#6750A4]">{charCount}자</span>
                <span className="mx-1 text-[#CBC4D2]">/</span>
                <span>{wordCount}단어</span>
              </div>
            </div>
          </div>

          {/* 작업 버튼: Gemini 감성 분석 & 재시작 */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="flex-1 py-3.5 px-4 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 fill-white ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Gemini가 감성 분석 중..." : "Gemini 3.8 Flash 감성 분석하기"}</span>
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3.5 rounded-full bg-[#F3EDF7] hover:bg-[#EAE0F5] text-[#4F378A] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E4D9EE]"
              title="새로 작성 (초기화)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>재시작</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A7582] text-center px-2">
            <CheckCircle2 className="w-3 h-3 text-[#006C4F] shrink-0" />
            <span>작성된 감정 일기는 종단간 암호화되어 안전하게 분석됩니다</span>
          </div>

          {/* 에러 메시지 알림 (API Key 부재 등) */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-[#FFF0F0] border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}
        </section>

        {/* AI 분석 완료 후에만 나타나는 감성 이모지 및 분석 결과 영역 */}
        {analysisResult && (
          <div className="flex flex-col gap-1 animate-fadeIn">
            {/* 감성 팔레트 섹션 (5개 감성 이모지 영역) */}
            <section className="px-5 py-3 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#494551]">
                <span className="text-[13px] text-[#1D1B20]">오늘의 감정 팔레트</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-[#EDE7F6] text-[#6750A4] text-[10px] font-bold">
                    AI 분석 완료
                  </span>
                  <span className="text-[11px] text-[#6750A4]">
                    가장 지배적인 감정: {analysisResult.dominantSentimentLabel}
                  </span>
                </div>
              </div>

              {/* 5개 감성 원형 버튼/아이콘 */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                {sentiments.map((s) => {
                  const Icon = s.icon;
                  const isDominant = currentDominant === s.id;
                  const percent = analysisResult.sentimentPercentages[s.id] ?? 0;

                  return (
                    <div
                      key={s.id}
                      className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-300 ${
                        isDominant ? s.activeRing : s.defaultBg
                      }`}
                    >
                      {/* 지배적인 감성 상단 배지 퍼센트 */}
                      {isDominant && (
                        <div className={`absolute -top-2.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-xs ${s.badgeColor}`}>
                          {percent}%
                        </div>
                      )}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1">
                        <Icon className={`w-5 h-5 ${isDominant ? "scale-110" : "opacity-80"}`} />
                      </div>
                      <span className="text-[11px] font-bold leading-tight">{s.label}</span>
                      <span className="text-[9px] opacity-70 leading-none mt-0.5">{s.subLabel}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* AI 일기 감성 분석 결과 영역 */}
            <section className="px-5 py-3 pb-6 flex flex-col gap-3">
              <div className="bg-gradient-to-b from-[#F7F2FD] to-[#FFFFFF] rounded-3xl p-4 border border-[#E9DFFA] shadow-sm flex flex-col gap-3.5">
                {/* 분석 헤더 배지 & 신뢰도 */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6750A4] text-white text-xs font-semibold shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    <span>gemini-3.8-flash 분석 리포트</span>
                  </div>
                  <div className="text-[11px] font-bold text-[#6750A4] flex items-center gap-1">
                    <span>신뢰도</span>
                    <span className="text-[13px]">{analysisResult.confidence}%</span>
                  </div>
                </div>

                {/* 밸런스 및 긍정 프로그레스 바 */}
                <div className="bg-white rounded-2xl p-3 border border-[#EFE9F6] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1.5 text-[#1D1B20]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"></span>
                      <span>{analysisResult.balanceTitle}</span>
                    </div>
                    <span className="text-[#7C3AED]">
                      긍정 {analysisResult.positivityScore}%
                    </span>
                  </div>
                  {/* 프로그레스 바 */}
                  <div className="w-full h-2.5 rounded-full bg-[#EADBDB]/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6750A4] to-[#8A4CFC] transition-all duration-700 ease-out"
                      style={{ width: `${analysisResult.positivityScore}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#554F5E] pt-1">
                    <div>
                      기분 안정성: <span className="font-semibold text-[#1D1B20]">{analysisResult.emotionalStability}</span>
                    </div>
                    <div>
                      피로 회복 지수: <span className="font-semibold text-[#006C4F]">{analysisResult.recoveryIndex}</span>
                    </div>
                  </div>
                </div>

                {/* 핵심 감정 키워드 */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-semibold text-[#554F5E]">핵심 감정 키워드</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#EFE6F7] text-[#4F378A] border border-[#E3D4F0]"
                      >
                        #{kw.replace(/^#/, "")}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gemini의 따뜻한 공감 노트 */}
                <div className="bg-[#FAF7FD] rounded-2xl p-3.5 border-l-4 border-l-[#7C3AED] border border-[#EDE4F5] flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#6750A4]">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Gemini의 따뜻한 공감 노트</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#36323F]">
                    {analysisResult.empathyNote}
                  </p>
                </div>

                {/* 마음 챙김 인용구 */}
                <div className="p-3 rounded-2xl bg-white/70 border border-[#ECE3F5] text-center flex flex-col items-center gap-1">
                  <Quote className="w-4 h-4 text-[#7C3AED] opacity-70" />
                  <p className="text-xs italic font-medium text-[#2E2938]">
                    &ldquo;{analysisResult.mindfulQuote}&rdquo;
                  </p>
                  <span className="text-[10px] text-[#7A7582]">
                    — {analysisResult.quoteAuthor}
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 세련된 Footer 영역 */}
        <footer className="mt-8 px-6 pt-7 pb-20 border-t border-[#F0EBF5] bg-gradient-to-b from-white to-[#FBF8FE] flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6750A4]">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Diary AI Sentiments Analyzer</span>
          </div>

          <p className="text-[11px] text-[#7A7582] leading-relaxed max-w-[320px]">
            인공지능 마음챙김 기술을 통해 당신의 하루를 따뜻하게 기록하고 내면의 균형을 찾아갑니다.
          </p>

          <div className="flex items-center gap-4 text-[11px] text-[#9C94A6] pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 개인정보 안전보호
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" /> 마음치유 AI
            </span>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#EADFF5] to-transparent my-1"></div>

          <p className="text-[10px] text-[#A29BAE] font-normal tracking-wide">
            Copyright © 2026 INU Diary AI Sentiments Analyzer by chaewon lim. All rights reserved.
          </p>
        </footer>

        {/* 모바일 하단 내비게이션 바 */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur-md border-t border-[#F0EBF5] py-2 px-6 flex items-center justify-between text-[10px] font-medium text-[#7A7582] z-40">
          <button className="flex flex-col items-center gap-0.5 text-[#6750A4] font-bold">
            <BookOpen className="w-4 h-4" />
            <span>일기 쓰기</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 hover:text-[#6750A4] transition">
            <CalendarDays className="w-4 h-4" />
            <span>감정 캘린더</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 hover:text-[#6750A4] transition">
            <LineChart className="w-4 h-4" />
            <span>통계·리포트</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 hover:text-[#6750A4] transition">
            <LayoutGrid className="w-4 h-4" />
            <span>핑거 피드</span>
          </button>
        </nav>

        {/* Gemini API Key 설정 모달 */}
        {showApiKeyModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 border border-[#E9DFFA]">
              <div className="flex items-center gap-2 text-[#6750A4]">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-bold text-base text-[#1D1B20]">Gemini API Key 설정</h3>
              </div>
              <p className="text-xs text-[#554F5E] leading-relaxed">
                Google AI Studio에서 발급받은 Gemini API 키를 입력하시면 실시간 <span className="font-bold text-[#6750A4]">Gemini 3.8 Flash</span> 모델과 직접 통신하여 실제 감성 분석을 진행합니다.
              </p>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CBE0] text-sm focus:outline-none focus:border-[#7C3AED]"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#554F5E] hover:bg-[#F3EDF7] transition cursor-pointer"
                >
                  닫기
                </button>
                <button
                  onClick={() => {
                    setShowApiKeyModal(false);
                    try {
                      if (customApiKey.trim()) {
                        localStorage.setItem("GEMINI_USER_API_KEY", customApiKey.trim());
                        alert("API 키가 안전하게 브라우저에 저장되었습니다.");
                      } else {
                        localStorage.removeItem("GEMINI_USER_API_KEY");
                        alert("API 키가 초기화되었습니다.");
                      }
                    } catch (e) {
                      console.warn(e);
                    }
                  }}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm transition cursor-pointer"
                >
                  저장하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 구글 시트 일기 목록 모달 (CRUD) */}
        {showListModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] shadow-2xl flex flex-col border border-[#E9DFFA] overflow-hidden">
              {/* 모달 헤더 */}
              <div className="p-5 border-b border-[#F0E6F7] flex items-center justify-between bg-[#FAF5FD]">
                <div className="flex items-center gap-2 text-[#4F378A]">
                  <List className="w-5 h-5 text-[#6750A4]" />
                  <h3 className="font-bold text-base text-[#1D1B20]">저장된 일기 목록</h3>
                  <span className="text-xs bg-[#EDE7F6] text-[#6750A4] px-2 py-0.5 rounded-full font-semibold">
                    {diaryList.length}개
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFetchList}
                    disabled={isLoadingList}
                    className="p-1.5 rounded-full hover:bg-[#EAE0F5] text-[#6750A4] transition cursor-pointer"
                    title="새로고침"
                  >
                    <RotateCcw className={`w-4 h-4 ${isLoadingList ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={() => {
                      setShowListModal(false);
                      setEditingItem(null);
                    }}
                    className="p-1.5 rounded-full hover:bg-[#EAE0F5] text-[#554F5E] transition cursor-pointer"
                    title="닫기"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 모달 본문 리스트 */}
              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {isLoadingList ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-2 text-[#7C3AED]">
                    <Loader2 className="w-7 h-7 animate-spin" />
                    <span className="text-xs font-medium text-[#554F5E]">구글 시트에서 일기를 불러오는 중...</span>
                  </div>
                ) : diaryList.length === 0 ? (
                  <div className="py-16 text-center text-[#7A7582] text-xs">
                    저장된 일기가 없습니다. 일기를 작성하고 [저장]을 눌러보세요!
                  </div>
                ) : (
                  diaryList.map((item) => (
                    <div
                      key={item.timestamp}
                      className="bg-[#FAF7FC] border border-[#E9E1F0] rounded-2xl p-4 flex flex-col gap-2.5 shadow-2xs hover:border-[#D5CBE0] transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-[#6750A4] bg-[#EDE7F6] px-2.5 py-0.5 rounded-full">
                          {item.datetime || "일시 미기재"}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              // 에디터로 불러와서 감성 분석하기
                              setContent(item.content);
                              setShowListModal(false);
                            }}
                            className="text-[11px] font-medium text-[#006C4F] bg-[#E8F5E9] hover:bg-[#C8E6C9] px-2 py-0.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                            title="에디터로 불러오기"
                          >
                            <FileText className="w-3 h-3" />
                            <span>불러오기</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setEditContent(item.content);
                            }}
                            className="p-1 rounded-lg hover:bg-[#EDE7F6] text-[#6750A4] transition cursor-pointer"
                            title="수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDiary(item.timestamp)}
                            className="p-1 rounded-lg hover:bg-rose-100 text-rose-500 transition cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 수정 모드일 때와 일반 표시 모드 */}
                      {editingItem?.timestamp === item.timestamp ? (
                        <div className="flex flex-col gap-2 pt-1">
                          <textarea
                            rows={4}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#7C3AED] focus:outline-none"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setEditingItem(null)}
                              className="px-2.5 py-1 text-xs rounded-lg text-[#554F5E] hover:bg-[#EAE0F5] transition"
                            >
                              취소
                            </button>
                            <button
                              onClick={handleUpdateDiary}
                              className="px-3 py-1 text-xs rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium transition shadow-xs"
                            >
                              수정 완료
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-[#2B2733] whitespace-pre-wrap leading-relaxed line-clamp-4">
                          {item.content}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* 모달 하단 푸터 */}
              <div className="p-3 bg-[#FAF5FD] border-t border-[#F0E6F7] text-right">
                <button
                  onClick={() => {
                    setShowListModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#4F378A] hover:bg-[#3D2970] text-white transition cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
