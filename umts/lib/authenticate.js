import middleware from '../middlewares/middleware'
import { extractUser } from './api-helpers'

const Authenticate = async (context) => {
  await middleware.run(context.req, context.res)
  const user = await extractUser(context.req)

  if (!user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
      props: {},
    }
  } else {
    return {
      props: {
        user: { name: user.name, email: user.email, superadmin: user.superadmin },
      },
    }
  }
}

export default Authenticate
