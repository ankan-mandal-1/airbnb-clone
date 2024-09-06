import React, { useEffect } from 'react'
import { useState } from 'react'
import Perks from "../components/Perks"
import axios from 'axios'
import PhotosUploader from '../components/PhotosUploader'
import AccountNav from '../components/AccountNav'
import { Navigate, useParams } from 'react-router-dom'

const PlacesFormPage = () => {

    const {id} = useParams()

    const [title, setTitle] = useState("")
    const [address, setAddress] = useState("")
    const [addedPhotos, setAddedPhotos] = useState([])
    const [description, setDescription] = useState("")
    const [perks, setPerks] = useState("")
    const [extraInfo, setExtraInfo] = useState("")
    const [checkIn, setCheckIn] = useState("")
    const [checkOut, setCheckOut] = useState("")
    const [maxGuests, setMaxGuests] = useState(1)
    const [price, setPrice] = useState(0)

    const [redirect, setRedirect] = useState(false)

    useEffect(() => {
        if(!id){
            return;
        }
        axios.get("/places/"+id).then(response => {
            const {data} = response;
            setTitle(data.title)
            setAddress(data.address)
            setAddedPhotos(data.photos)
            setDescription(data.description)
            setPerks(data.perks)
            setExtraInfo(data.extraInfo)
            setCheckIn(data.checkIn)
            setCheckOut(data.checkOut)
            setMaxGuests(data.maxGuests);
            setPrice(data.price)
        })
    }, [])
 
    const inputHeader = (text) => {
        return(
            <h2 className='text-2xl mt-4'>{text}</h2>
        )
    }

    const inputDescription = (text) => {
        return(
            <p className='text-gray-500 text-sm'>{text}</p>
        )
    }

    const preInput = (header, description) => {
        return(
            <>
                {inputHeader(header)}
                {inputDescription(description)}
            </>
        )
    }

    const savePlace = async (e) => {
        e.preventDefault()

        const placeData = {title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price}

        if(id){
            //Update
            await axios.put("/places", {id, ...placeData})
            setRedirect(true)
        } else {
            // New Place
            await axios.post("/places", placeData)
            setRedirect(true)
        }
        
    }

    if(redirect){
        return <Navigate to={"/account/places"} />
    }

  return (
    <div>
        <AccountNav />
        <form onSubmit={savePlace}>
            {preInput("Title", "Title for your place")}
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Title' />

            {preInput("Address", "Address to this place")}
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder='Address' />

            {preInput("Photos", "More = Better")}
            <PhotosUploader addedPhotos={addedPhotos} setAddedPhotos={setAddedPhotos} />

            {preInput("Description", "Description for your Place")}
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

            {preInput("Perks", "Select all perks for your place")}
            <div className='grid gap-2 mt-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6'>
                <Perks selected={perks} onChange={setPerks} />
            </div>

            {preInput("Extra Info", "House rules, etc")}
            <textarea value={extraInfo} onChange={(e) => setExtraInfo(e.target.value)} />

            {preInput("Check In & out time, max-guest", "Add check in and out times")}
            <div className='grid gap-2 grid-cols-2 md:grid-cols-4'>
                <div className='mt-2 -mb-1'>
                    <h3>Check in time</h3>
                    <input type="text" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} placeholder='14:00'/>
                </div>
                <div className='mt-2 -mb-1'>
                    <h3>Check out time</h3>
                    <input type="text" value={checkOut} onChange={e => setCheckOut(e.target.value)} placeholder='11:00'/>
                </div>
                <div className='mt-2 -mb-1'>
                    <h3>Max number of guests</h3>
                    <input type="number" min={0} value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} />
                </div>
                <div className='mt-2 -mb-1'>
                    <h3>Price ($)</h3>
                    <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
            </div>
            <button className='primary my-4'>Save</button>
        </form>
    </div>
  )
}

export default PlacesFormPage