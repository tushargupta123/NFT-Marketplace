import React,{useState} from 'react'
import {ethers} from "ethers"
import {Row,Form,Button} from "react-bootstrap"
import {create} from "ipfs-http-client"
import {Buffer} from 'buffer'

const projectId = "2LAxUVxbn06Pi0Y6zr6AAGN12Dr"
const projectSecret = "0b4b777ce2c76d739ce713e705cf203f"
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const client = create({
  host:'ipfs.infura.io',
  port:5001,
  protocol: 'https',
  headers: {
    authorization: auth
  },
})

const Create = ({marketplace,nft}) => {

  const [image, setImage] = useState('')
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const uploadToIPFS = async(event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if(typeof(file) !== 'undefined'){
      try{
        const result = await client.add(file);
        console.log(result);
        setImage(`https://infura-ipfs.io/ipfs/${result.path}`)
      }catch(e){
        console.log("ipfs image upload error : ",e);
      }
    }
  }

  const createNFT = async() => {
    if (!image || !price || !name || !description) return;
    try{
      const result = await client.add(JSON.stringify({image,price,name,description}))
      mintThenList(result);
    }catch(e){
      console.log("ipfs uri upload error: ",e);
    }
  }

  const mintThenList = async(result) => {
    const uri = `https://infura-ipfs.io/ipfs/${result.path}`
    // mint nft
    await (await nft.mint(uri)).wait();
    // get tokenId of new NFT
    const id = await nft.tokenCount();
    // approve marketplace to spend nft
    await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString());
    await (await marketplace.makeItem(nft.address,id,listingPrice)).wait();
  }

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Create