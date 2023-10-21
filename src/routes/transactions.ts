import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionRoutes(app: FastifyInstance) {
    app.addHook('preHandler', async (request, reply) => {
        console.log(`[${request.method} ${request.url}]`)
    })

    app.get('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies

        const transactions = await knex('transactions')
            .where('session_id', sessionId)
            .select('*')

        return reply.status(200).send({ transactions: transactions })
    })

    app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies

        const getTransactionsParamSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = getTransactionsParamSchema.parse(request.params)

        const transaction = await knex('transactions')
            .where({
                id,
                session_id: sessionId
            })
            .first()

        return reply.status(200).send({ transaction: transaction })
    })

    app.get('/summary', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies

        const summary = await knex('transactions')
            .where('session_id', sessionId)
            .sum('amount', { as: 'amount' })
            .first()

        const roundedAmount = Number(summary?.amount.toFixed(2)) // due to the JS inaccuracies

        return reply.status(200).send({ summary: { amount: roundedAmount } })
    })

    app.post('/', async (request, reply) => {
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['CREDIT', 'DEBIT'])
        })

        const { title, amount, type } = createTransactionBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if (!sessionId) {
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            })
        }

        await knex('transactions').insert({
            id: randomUUID(),
            title,
            amount: type === 'CREDIT' ? amount : amount * -1,
            session_id: sessionId
        })

        return reply.status(201).send({ message: 'The transaction has been created successfully.' })
    })
}