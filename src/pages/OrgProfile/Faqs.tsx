"use client"

import * as React from "react"
import { Play, Search, BookOpen } from "lucide-react"
import { Input } from "../../components/ui/input"
// import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../components/ui/carousel"
import { Card, CardContent } from "../../components/ui/card"
import API_CONSTANTS from "../../constants/apiConstants"
import { useGetApi } from "../../services/use-api"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "../../components/ui/dialog"
import Dashbord from "../../assets/Dashbord.png"
import Appointment from "../../assets/Appointment.png"
import Biling from "../../assets/Biling.png"
import CreatReport from "../../assets/Report.png"
import PatientPage from "../../assets/PatientPage.png"
// const videos = [
//   {
//     id: 1,
//     title: "Getting started with Hospital App",
//     description: "Learn the basics and set up your account",
//     thumbnail: "/hospital-dashboard-interface.jpg",
//     link: "https://www.youtube.com/watch?v=abcd1234",
//     category: "Basics",
//   },
//   {
//     id: 2,
//     title: "Doctor Appointment Workflow",
//     description: "Master scheduling and managing appointments",
//     thumbnail: "/appointment-scheduling-system.jpg",
//     link: "https://www.youtube.com/watch?v=efgh5678",
//     category: "Workflow",
//   },
//   {
//     id: 3,
//     title: "Billing and Invoice Management",
//     description: "Complete guide to billing operations",
//     thumbnail: "/billing-invoice-dashboard.jpg",
//     link: "https://www.youtube.com/watch?v=ijkl91011",
//     category: "Billing",
//   },
//   {
//     id: 4,
//     title: "Patient Record Management",
//     description: "Organize and access patient information",
//     thumbnail: "/patient-records-management.jpg",
//     link: "https://www.youtube.com/watch?v=mnop1213",
//     category: "Records",
//   },
//   {
//     id: 5,
//     title: "Advanced Analytics & Reports",
//     description: "Generate insights from your data",
//     thumbnail: "/analytics-report-dashboard.jpg",
//     link: "https://www.youtube.com/watch?v=qrst1415",
//     category: "Analytics",
//   },
// ]



export default function HelpAndTutorials() {
  const [search, setSearch] = React.useState("")
  const [faqData, setFaqData] = React.useState<any>(null)
  const { getData: GetReportApi } = useGetApi<any>("");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const videoData = faqData?.find((item: any) => item._id === "video")?.items || [];

  const thumbnailMap: any = {
    Basics: Dashbord,
    Workflow: Appointment,
    Billing: Biling,
    Records: PatientPage,
    Analytics: CreatReport,
  };



  // const filteredVideos = videos.filter(
  //   (v) =>
  //     v.title.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase()),
  // )

  useEffect(() => {
    fetchFaqs();
  }, [search]);

  const fetchFaqs = async () => {
    const response: any = await GetReportApi(
      `${API_CONSTANTS.GET_ALL_FAQS}?search=${encodeURIComponent(search)}`
    );
    if (response && response?.data) {
      setFaqData(response?.data?.data);
    }
  };

  return (
    <div className="">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 pt-8 pb-10">

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          <div className="flex justify-center">
            <BookOpen className="w-16 h-16 text-white opacity-90" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 text-balance">How can we help?</h1>
          <p className="text-white/80 text-lg mb-5 text-balance">
            Find tutorials, guides, and resources to master the Hospital App
          </p>

          <div className="flex justify-center max-w-2xl mx-auto px-4">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search tutorials, topics, or categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full text-base border-0 focus:ring-2 focus:ring-offset-0 focus:ring-white bg-white text-gray-900 placeholder:text-gray-500 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Section */}

      <div className="container mx-auto px-4 pb-[40px] pt-[20px] bg-white">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800 text-start">
          Video Tutorials
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoData.map((video: any) => (
            <Dialog key={video._id} onOpenChange={(isOpen) => !isOpen && setSelectedVideo(null)}>
              <DialogTrigger asChild>
                <div
                  onClick={() => setSelectedVideo(video)}
                  className="cursor-pointer"
                >
                  <Card className="overflow-hidden border-0 shadow-[0px_1px_3px_0px_rgba(16,24,40,0.12)] hover:shadow-xl transition-all duration-300 bg-card hover:bg-card/95 group">
                    <div className="relative overflow-hidden h-48 bg-muted">
                      <img
                        src={video.thumbnail ? video.thumbnail : thumbnailMap[video.category]}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 fill-white" />
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-teal-700">
                        {video.category}
                      </div>
                    </div>
                    <CardContent className="p-5">
                      {/* <p className="text-sm font-semibold text-teal-600 mb-2 uppercase tracking-wide text-start">
                        Video Tutorial
                      </p> */}
                      <h3 className="text-start font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-start text-sm text-muted-foreground line-clamp-2">
                        {video.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </DialogTrigger>

              {selectedVideo && (
                <DialogContent className="p-0 max-w-3xl">
                  <div className="aspect-video w-full">
                    <iframe
                      src={selectedVideo.link}
                      title={selectedVideo.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          ))}
        </div>
      </div>



    </div>
  )
}
