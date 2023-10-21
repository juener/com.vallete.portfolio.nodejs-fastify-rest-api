import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { execSync } from 'child_process'

describe('Transactions routes', () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })

    it('should be able to create a new transaction', async () => {
        await request(app.server)
            .post('/transactions')
            .send({
                title: 'New Transaction - Automated Tests | CreateTransaction',
                amount: 9.99,
                type: 'CREDIT'
            })
            .expect(201)
    })

    it('should be able to list all its transactions', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New Transaction - Automated Tests | AllTransactions',
                amount: 9.99,
                type: 'CREDIT'
            })

        const cookies = createTransactionResponse.get('Set-Cookie')

        const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New Transaction - Automated Tests | AllTransactions',
                amount: 9.99
            })
        ])
    })

    it('should be able to get a specific transaction', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New Transaction - Automated Tests | SpecificTransaction',
                amount: 8.88,
                type: 'DEBIT'
            })

        const cookies = createTransactionResponse.get('Set-Cookie')

        const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

        const transactionId = listTransactionsResponse.body.transactions[0].id

        const getTransactionResponse = await request(app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200)

        expect(getTransactionResponse.body.transaction).toEqual(
            expect.objectContaining({
                title: 'New Transaction - Automated Tests | SpecificTransaction',
                amount: -8.88,
            })
        )
    })

    it('should be able to get the summary', async () => {
        const createFirstTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New Transaction - Automated Tests | Summary01',
                amount: 7.77,
                type: 'CREDIT'
            })

        const cookies = createFirstTransactionResponse.get('Set-Cookie')

        await request(app.server)
            .post('/transactions')
            .send({
                title: 'New Transaction - Automated Tests | Summary02',
                amount: 1.11,
                type: 'DEBIT'
            })
            .set('Cookie', cookies)

        const getSummaryResponse = await request(app.server)
            .get('/transactions/summary')
            .set('Cookie', cookies)
            .expect(200)

        expect(getSummaryResponse.body.summary).toEqual({
            amount: 6.66
        })
    })
})


