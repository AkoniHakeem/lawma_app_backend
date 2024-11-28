import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Currency } from "./currency.entity";

@Entity()
export default class WalletReference {
    @PrimaryGeneratedColumn({ type: 'bigint'})
    id: string;

    @Column({ type: 'varchar'})
    publicReference: string;

    @Column({ type: 'bigint'})
    authenticatedUserId: string;

    @Column({ type: 'boolean', default: false })
    isCompanyWallet: boolean;


    // foreign keys
    @Column({ type: 'bigint'})
    currencyId: string;

    // relations
    @ManyToOne(() => Currency, (currency) => currency.walletReferences) 
    @JoinColumn({ name: 'currencyId'})
    currency: Currency;
}