import React, { useContext, useEffect, useState } from 'react'
import {differenceInCalendarDays} from "date-fns"
import axios from 'axios'
import { UserContext } from '../UserContext'
import { Navigate } from 'react-router-dom'

const BookingWidget = ({place}) => {

    const [checkIn, setCheckIn] = useState("")
    const [checkOut, setCheckOut] = useState("")
    const [numberOfGuests, setNumberOfGuests] = useState(1)
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("")
    const [redirect, setRedirect] = useState("")

    const {user} = useContext(UserContext)

    useEffect(() => {
      if(user){
        setName(user.name)
      }
    }, [user])

    let numberONights = 0;
    if(checkIn && checkOut){
        numberONights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn))
    }

    const bookThisPlace = async () => {
        const data = {checkIn, checkOut, numberOfGuests, name, phone, 
            place: place._id,
            price: numberONights * place.price
        }
        const response = await axios.post("/bookings", data);
        const bookingId = response.data._id
        setRedirect(`/account/bookings/${bookingId}`)
    }

    if(redirect){
        return <Navigate to={redirect} />
    }

  return (
    <>
        <div className='bg-white shadow p-4 rounded-2xl'>
            <div className="text-2xl text-center">
            Price: ${place.price} / per night
            </div>
            <div className="border rounded-2xl mt-4">
              <div className="flex">
                <div className="py-2 px-3">
                  <label>Check in</label>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </div>
                <div className="py-2 px-3 border-l">
                  <label>Check out:</label>
                  <input type="date" alue={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </div>
              </div>
              <div className="py-2 px-3">
                  <label>Number of guests:</label>
                  <input type="number" value={numberOfGuests} onChange={(e) => setNumberOfGuests(e.target.value)} />
                </div>
            </div>
            {numberONights > 0 && (
                <>
                <div className="py-2 px-3">
                 <label>Name:</label>
                 <input type="text" placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} />
               </div>
               <div className="py-2 px-3">
               <label>Phone Number:</label>
               <input type="tel" placeholder='Phone number' value={phone} onChange={(e) => setPhone(e.target.value)} />
             </div>
             </>
            )}
            <button onClick={bookThisPlace} className="primary mt-4">
                Book this place {" "}
                {numberONights > 0 && (
                    <span>
                        ${numberONights * place.price}
                    </span>
                )}
            </button>
          </div>
    </>
  )
}

export default BookingWidget