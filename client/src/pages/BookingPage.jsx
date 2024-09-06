import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import AddressLink from '../components/AddressLink'
import PlaceGallery from '../components/PlaceGallery'

const BookingPage = () => {
    const {id} = useParams()
    const [booking, setBooking] = useState(null)

    useEffect(() => {
      if(id){
        axios.get("/bookings").then(response => {
          const foundBooking = response.data.find(({_id}) => _id === id)
          if(foundBooking){
            setBooking(foundBooking)
          }
        })
      }
    }, [id])

    if(!booking){
      return ""
    }

  return (
    <div className='mt-8'>
      <h2 className='text-3xl'>{booking.place.title}</h2>
      <AddressLink className="my-2 block">{booking.place.address}</AddressLink>
      <div className="bg-gray-200 p-4 mb-4 rounded-2xl">
        <h2 className='text-xl'>Your Booking Information</h2>
      </div>
      <PlaceGallery place={booking.place}/>
    </div>
  )
}

export default BookingPage