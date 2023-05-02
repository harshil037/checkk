import Authenticate from '../../lib/authenticate'

const Admin = ({ user }) => {
  return <></>
}

export default Admin

export async function getServerSideProps(context) {
  return Authenticate(context)
}
